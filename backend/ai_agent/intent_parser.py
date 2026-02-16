import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class Intent:
    action: str
    commands: List[Dict[str, Any]]
    confidence: float

class IntentParser:
    """
    Converts natural language prompts to structured JSON commands
    """
    
    def __init__(self):
        self.action_patterns = {
            'update_style': [
                r'change\s+(?:the\s+)?(.+?)\s+(?:to|color|background|font)',
                r'make\s+(?:the\s+)?(.+?)\s+(.+?)',
                r'set\s+(?:the\s+)?(.+?)\s+(?:to|as)\s+(.+)',
                r'update\s+(?:the\s+)?(.+?)\s+(?:to|as)\s+(.+)',
            ],
            'update_text': [
                r'change\s+(?:the\s+)?text\s+(?:to|as)\s+(.+)',
                r'update\s+(?:the\s+)?text\s+(?:to|as)\s+(.+)',
                r'set\s+(?:the\s+)?text\s+(?:to|as)\s+(.+)',
            ],
            'add_element': [
                r'add\s+(?:a\s+)?(.+?)(?:\s+to|$)',
                r'create\s+(?:a\s+)?(.+?)(?:\s+to|$)',
                r'insert\s+(?:a\s+)?(.+?)(?:\s+to|$)',
            ],
            'remove_element': [
                r'remove\s+(?:the\s+)?(.+?)(?:\s+from|$)',
                r'delete\s+(?:the\s+)?(.+?)(?:\s+from|$)',
            ],
        }
        
        self.color_map = {
            'blue': '#0000ff',
            'red': '#ff0000',
            'green': '#00ff00',
            'yellow': '#ffff00',
            'black': '#000000',
            'white': '#ffffff',
            'cyan': '#00f5ff',
            'magenta': '#ff00aa',
        }
    
    def parse(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> Intent:
        """
        Parse user prompt into structured commands
        """
        prompt_lower = prompt.lower().strip()
        commands = []
        action = 'update_style'
        confidence = 0.7
        
        # Extract color changes
        if any(word in prompt_lower for word in ['color', 'background', 'bg']):
            color = self._extract_color(prompt_lower)
            target = self._extract_target(prompt_lower, 'body')
            
            if color:
                commands.append({
                    'action': 'update_style',
                    'target': target,
                    'property': 'background-color' if 'background' in prompt_lower else 'color',
                    'value': color
                })
                action = 'update_style'
                confidence = 0.9
        
        # Extract text changes
        elif any(word in prompt_lower for word in ['text', 'heading', 'title', 'h1', 'h2']):
            text_match = re.search(r'(?:text|heading|title|h1|h2)\s+(?:to|as|is)\s+(.+)', prompt_lower)
            if text_match:
                new_text = text_match.group(1).strip()
                target = 'h1' if 'h1' in prompt_lower or 'heading' in prompt_lower else 'p'
                commands.append({
                    'action': 'update_text',
                    'target': target,
                    'value': new_text
                })
                action = 'update_text'
                confidence = 0.85
        
        # Extract element addition
        elif any(word in prompt_lower for word in ['add', 'create', 'insert']):
            element_match = re.search(r'(?:add|create|insert)\s+(?:a\s+)?(.+?)(?:\s+to|\s+with|$)', prompt_lower)
            if element_match:
                element_type = element_match.group(1).strip()
                html_element = self._map_element_type(element_type)
                commands.append({
                    'action': 'add_element',
                    'element': f'<{html_element}>New {element_type}</{html_element}>',
                    'parent': 'body'
                })
                action = 'add_element'
                confidence = 0.8
        
        # Extract element removal
        elif any(word in prompt_lower for word in ['remove', 'delete']):
            element_match = re.search(r'(?:remove|delete)\s+(?:the\s+)?(.+?)(?:\s+from|$)', prompt_lower)
            if element_match:
                target = element_match.group(1).strip()
                commands.append({
                    'action': 'remove_element',
                    'target': target
                })
                action = 'remove_element'
                confidence = 0.8
        
        # Default: style update
        if not commands:
            commands.append({
                'action': 'update_style',
                'target': 'body',
                'property': 'background-color',
                'value': '#f0f0f0'
            })
            confidence = 0.5
        
        return Intent(action=action, commands=commands, confidence=confidence)
    
    def _extract_color(self, prompt: str) -> Optional[str]:
        """Extract color from prompt"""
        for color_name, hex_code in self.color_map.items():
            if color_name in prompt:
                return hex_code
        
        # Try to extract hex code
        hex_match = re.search(r'#([0-9a-f]{6})', prompt, re.IGNORECASE)
        if hex_match:
            return f"#{hex_match.group(1)}"
        
        return None
    
    def _extract_target(self, prompt: str, default: str = 'body') -> str:
        """Extract target element from prompt"""
        if 'body' in prompt:
            return 'body'
        if 'button' in prompt:
            return 'button'
        if 'heading' in prompt or 'h1' in prompt:
            return 'h1'
        if 'paragraph' in prompt or 'p' in prompt:
            return 'p'
        return default
    
    def _map_element_type(self, element_type: str) -> str:
        """Map natural language to HTML element"""
        element_type = element_type.lower()
        mapping = {
            'button': 'button',
            'heading': 'h1',
            'title': 'h1',
            'paragraph': 'p',
            'text': 'p',
            'div': 'div',
            'image': 'img',
            'link': 'a',
        }
        return mapping.get(element_type, 'div')
