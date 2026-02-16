from typing import List, Dict, Any, Optional

class ConstraintEngine:
    """
    Validates and constrains AI commands to prevent unintended changes
    """
    
    def __init__(self):
        self.allowed_actions = [
            'update_style',
            'update_text',
            'add_element',
            'remove_element',
        ]
        
        self.allowed_targets = [
            'body',
            'h1', 'h2', 'h3',
            'p',
            'button',
            'div',
        ]
        
        self.allowed_properties = [
            'color',
            'background-color',
            'font-size',
            'padding',
            'margin',
        ]
    
    def validate(self, commands: List[Dict[str, Any]], context: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Validate commands against constraints
        """
        validated = []
        
        for cmd in commands:
            # Check action is allowed
            if cmd.get('action') not in self.allowed_actions:
                continue
            
            # Validate based on action type
            if cmd['action'] == 'update_style':
                validated_cmd = self._validate_style_update(cmd)
                if validated_cmd:
                    validated.append(validated_cmd)
            
            elif cmd['action'] == 'update_text':
                validated_cmd = self._validate_text_update(cmd)
                if validated_cmd:
                    validated.append(validated_cmd)
            
            elif cmd['action'] == 'add_element':
                validated_cmd = self._validate_add_element(cmd)
                if validated_cmd:
                    validated.append(validated_cmd)
            
            elif cmd['action'] == 'remove_element':
                validated_cmd = self._validate_remove_element(cmd)
                if validated_cmd:
                    validated.append(validated_cmd)
        
        return validated
    
    def _validate_style_update(self, cmd: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Validate style update command"""
        target = cmd.get('target', 'body')
        property_name = cmd.get('property', '')
        value = cmd.get('value', '')
        
        if target not in self.allowed_targets:
            return None
        
        if property_name not in self.allowed_properties:
            # Try to map common property names
            property_mapping = {
                'color': 'color',
                'background': 'background-color',
                'bg': 'background-color',
                'font-size': 'font-size',
            }
            property_name = property_mapping.get(property_name.lower(), property_name)
        
        if not value:
            return None
        
        return {
            'action': 'update_style',
            'target': target,
            'property': property_name,
            'value': value
        }
    
    def _validate_text_update(self, cmd: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Validate text update command"""
        target = cmd.get('target', 'p')
        value = cmd.get('value', '')
        
        if target not in self.allowed_targets:
            return None
        
        if not value or len(value) > 500:  # Max text length constraint
            return None
        
        return {
            'action': 'update_text',
            'target': target,
            'value': value
        }
    
    def _validate_add_element(self, cmd: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Validate add element command"""
        element = cmd.get('element', '')
        parent = cmd.get('parent', 'body')
        
        if not element or not element.startswith('<'):
            return None
        
        if parent not in ['body', 'div']:
            return None
        
        return {
            'action': 'add_element',
            'element': element,
            'parent': parent
        }
    
    def _validate_remove_element(self, cmd: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Validate remove element command"""
        target = cmd.get('target', '')
        
        if target not in self.allowed_targets:
            return None
        
        # Prevent removing body
        if target == 'body':
            return None
        
        return {
            'action': 'remove_element',
            'target': target
        }
