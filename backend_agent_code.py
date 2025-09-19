# agent.py
import uuid
import re
import json
from typing import Dict, Any, List
from langchain_core.messages import AIMessage
from deepagents import create_deep_agent
from langgraph.graph.ui import push_ui_message

def extract_data_blocks(content: str) -> List[Dict[str, Any]]:
    """Extract data blocks with flexible parsing - no strict XML required"""
    visualizations = []
    
    # Chart data extraction with flexible patterns
    chart_patterns = [
        r'<chart[^>]*>(.*?)</chart>',
        r'<CHART[^>]*>(.*?)</CHART>',
        r'```chart\s*(.*?)```',
    ]
    
    table_patterns = [
        r'<table[^>]*>(.*?)</table>',
        r'<TABLE[^>]*>(.*?)</TABLE>',
        r'```table\s*(.*?)```',
    ]
    
    mermaid_patterns = [
        r'<mermaid[^>]*>(.*?)</mermaid>',
        r'<MERMAID[^>]*>(.*?)</MERMAID>',
        r'```mermaid\s*(.*?)```',
    ]
    
    # Extract chart data
    for pattern in chart_patterns:
        matches = re.findall(pattern, content, re.DOTALL | re.IGNORECASE)
        for match in matches:
            viz_data = parse_chart_content(match)
            if viz_data:
                visualizations.append(viz_data)
    
    # Extract table data
    for pattern in table_patterns:
        matches = re.findall(pattern, content, re.DOTALL | re.IGNORECASE)
        for match in matches:
            viz_data = parse_table_content(match)
            if viz_data:
                visualizations.append(viz_data)
    
    # Extract mermaid data
    for pattern in mermaid_patterns:
        matches = re.findall(pattern, content, re.DOTALL | re.IGNORECASE)
        for match in matches:
            viz_data = parse_mermaid_content(match)
            if viz_data:
                visualizations.append(viz_data)
    
    return visualizations

def parse_chart_content(content: str) -> Dict[str, Any]:
    """Parse chart content - expecting JSON format with enhanced features"""
    try:
        # Try to parse as JSON first
        data_obj = json.loads(content.strip())
        
        viz_data = {
            'type': 'chart',
            'title': data_obj.get('title', 'Chart'),
            'description': data_obj.get('description', ''),
            'data': data_obj.get('data', []),
            'xAxisLabel': data_obj.get('xAxisLabel', ''),
            'yAxisLabel': data_obj.get('yAxisLabel', ''),
            'series': data_obj.get('series', []),
            'chartType': 'bar',
            'availableTypes': ['bar']
        }
        
        # If no series defined but data has multiple value fields, auto-create series
        if not viz_data['series'] and viz_data['data']:
            first_item = viz_data['data'][0]
            value_keys = [k for k in first_item.keys() if k != 'name' and isinstance(first_item.get(k), (int, float))]
            
            if len(value_keys) > 1:
                # Multiple series detected
                colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']
                viz_data['series'] = [
                    {
                        'key': key,
                        'name': key.replace('_', ' ').title(),
                        'color': colors[i % len(colors)]
                    }
                    for i, key in enumerate(value_keys)
                ]
            elif len(value_keys) == 1:
                # Single series
                viz_data['series'] = [{
                    'key': value_keys[0],
                    'name': value_keys[0].replace('_', ' ').title(),
                    'color': '#0088FE'
                }]
        
        # Detect chart type from content and data structure
        content_lower = content.lower()
        has_multiple_series = len(viz_data['series']) > 1
        
        if any(word in content_lower for word in ['time', 'trend', 'over time', 'timeline', 'monthly', 'daily', 'yearly']):
            viz_data['chartType'] = 'line'
            viz_data['availableTypes'] = ['line', 'area', 'bar'] + (['stacked-bar'] if has_multiple_series else [])
        elif any(word in content_lower for word in ['percentage', 'proportion', 'parts', 'distribution', 'share']):
            viz_data['chartType'] = 'pie'
            viz_data['availableTypes'] = ['pie', 'donut', 'bar']
        elif any(word in content_lower for word in ['correlation', 'scatter', 'relationship', 'vs', 'against']):
            viz_data['chartType'] = 'scatter'
            viz_data['availableTypes'] = ['scatter', 'line']
        elif has_multiple_series:
            viz_data['chartType'] = 'bar'
            viz_data['availableTypes'] = ['bar', 'grouped-bar', 'stacked-bar', 'line', 'area']
        else:
            viz_data['availableTypes'] = ['bar', 'line', 'pie']
        
        return viz_data if viz_data['data'] else None
        
    except json.JSONDecodeError:
        print(f"Invalid JSON in chart content: {content}")
        return None

def parse_table_content(content: str) -> Dict[str, Any]:
    """Parse table content - expecting JSON format with enhanced column config"""
    try:
        # Parse as JSON
        data_obj = json.loads(content.strip())
        
        viz_data = {
            'type': 'table',
            'title': data_obj.get('title', 'Data Table'),
            'description': data_obj.get('description', ''),
            'data': data_obj.get('data', []),
            'columns': data_obj.get('columns', [])
        }
        
        # If no columns config provided, auto-generate from data
        if not viz_data['columns'] and viz_data['data']:
            first_item = viz_data['data'][0]
            viz_data['columns'] = []
            
            for key, value in first_item.items():
                # Auto-detect column type
                col_type = 'text'
                if isinstance(value, (int, float)):
                    if key.lower() in ['salary', 'price', 'cost', 'revenue', 'amount']:
                        col_type = 'currency'
                    else:
                        col_type = 'number'
                elif isinstance(value, str):
                    if 'date' in key.lower() or 'time' in key.lower():
                        col_type = 'date'
                    elif key.lower() in ['email']:
                        col_type = 'email'
                    elif key.lower() in ['url', 'link', 'website']:
                        col_type = 'url'
                
                viz_data['columns'].append({
                    'key': key,
                    'label': key.replace('_', ' ').title(),
                    'type': col_type
                })
        
        return viz_data if viz_data['data'] else None
        
    except json.JSONDecodeError:
        print(f"Invalid JSON in table content: {content}")
        return None

def parse_mermaid_content(content: str) -> Dict[str, Any]:
    """Parse mermaid diagram content - expecting JSON format with enhanced styling"""
    try:
        # Parse as JSON
        data_obj = json.loads(content.strip())
        
        viz_data = {
            'type': 'mermaid',
            'title': data_obj.get('title', 'Relationship Diagram'),
            'description': data_obj.get('description', ''),
            'diagram': data_obj.get('diagram', ''),
            'theme': data_obj.get('theme', 'default'),
            'config': data_obj.get('config', {}),
            'diagramType': 'graph'
        }
        
        # Detect diagram type
        diagram_content = viz_data['diagram'].lower()
        if 'graph td' in diagram_content or 'graph lr' in diagram_content:
            viz_data['diagramType'] = 'graph'
        elif 'erdiagram' in diagram_content or 'er' in diagram_content:
            viz_data['diagramType'] = 'er'
        elif 'flowchart' in diagram_content:
            viz_data['diagramType'] = 'flowchart'
        elif 'sequencediagram' in diagram_content:
            viz_data['diagramType'] = 'sequence'
        elif 'classDiagram' in diagram_content:
            viz_data['diagramType'] = 'class'
        
        return viz_data if viz_data['diagram'] else None
        
    except json.JSONDecodeError:
        print(f"Invalid JSON in mermaid content: {content}")
        return None

def post_model_hook(state: Dict[str, Any]) -> Dict[str, Any]:
    """Enhanced hook that detects and creates visualizations with flexible parsing"""
    messages = state.get("messages", [])
    if not messages:
        return {}
    
    last_message = messages[-1]
    if not isinstance(last_message, AIMessage):
        return {}
    
    content = str(last_message.content)
    
    # Extract data blocks with flexible parsing
    visualizations = extract_data_blocks(content)
    
    for viz in visualizations:
        if viz['type'] == 'chart':
            push_ui_message("dynamicChart", viz, message=last_message)
        elif viz['type'] == 'table':
            push_ui_message("dataTable", viz, message=last_message)
        elif viz['type'] == 'mermaid':
            push_ui_message("mermaidDiagram", viz, message=last_message)
    
    return {}

# Enhanced system instructions for data discovery
SYSTEM_INSTRUCTIONS = """
You are a data discovery agent with advanced visualization capabilities. When presenting data insights, wrap your data with simple tags using JSON format only.

## Data Presentation Format:

### For Chart Visualizations:
Always use this exact format with optional advanced fields:
<chart>
{
  "title": "Chart Title Here",
  "description": "Brief description",
  "xAxisLabel": "X Axis Label (optional)",
  "yAxisLabel": "Y Axis Label (optional)",
  "data": [
    {"name": "Category1", "value": 100, "series2": 80},
    {"name": "Category2", "value": 150, "series2": 120}
  ],
  "series": [
    {"key": "value", "name": "Primary Data", "color": "#0088FE"},
    {"key": "series2", "name": "Secondary Data", "color": "#00C49F"}
  ]
}
</chart>

Simple single series format:
<chart>
{"title": "Sales Data", "description": "Monthly sales", "data": [{"name": "Jan", "value": 100}, {"name": "Feb", "value": 150}]}
</chart>

### For Tables:
Always use this exact format with optional column configuration:
<table>
{
  "title": "Table Title Here",
  "description": "Brief description",
  "data": [
    {"name": "John", "age": 30, "salary": 50000, "date": "2023-01-15"},
    {"name": "Jane", "age": 25, "salary": 60000, "date": "2023-02-20"}
  ],
  "columns": [
    {"key": "name", "label": "Full Name", "type": "text"},
    {"key": "age", "label": "Age", "type": "number"},
    {"key": "salary", "label": "Salary", "type": "currency"},
    {"key": "date", "label": "Start Date", "type": "date"}
  ]
}
</table>

Simple format (auto-detect columns):
<table>
{"title": "User Data", "description": "User information", "data": [{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]}
</table>

### For Relationship Diagrams:
Always use this exact format with optional styling:
<mermaid>
{
  "title": "Diagram Title",
  "description": "Brief description",
  "diagram": "graph TD\n    A[Users] --> B[Orders]\n    B --> C[Products]",
  "theme": "default",
  "config": {
    "nodeSpacing": 50,
    "rankSpacing": 50
  }
}
</mermaid>

Simple format:
<mermaid>
{"title": "Database Schema", "description": "Table relationships", "diagram": "graph TD\n    Users --> Orders\n    Orders --> Products"}
</mermaid>

## Important Rules:
1. ALWAYS use valid JSON inside the tags
2. ALWAYS include title, description, and data/diagram fields
3. For charts: data should have "name" field and at least one value field
4. Advanced fields (xAxisLabel, series, columns, theme) are optional
5. For mermaid: use \\n for line breaks in diagram string

## Chart Type Selection:
The system will automatically choose the best chart type based on your data:
- Time series data → Line charts
- Categorical comparisons → Bar charts  
- Part-of-whole data → Pie charts
- Multiple series data → Grouped/stacked charts
- Correlations → Scatter plots

Focus on providing clean, structured data in JSON format. Include advanced fields only when needed for clarity.
"""

def search_tool(query: str) -> str:
    """Sample data discovery tool - replace with your actual implementation"""
    # Your actual data discovery logic here
    return f"Discovered data for {query} - analyzing structure and relationships..."

# Create enhanced agent
agent = create_deep_agent(
    tools=[search_tool],
    instructions=SYSTEM_INSTRUCTIONS,
    post_model_hook=post_model_hook
)