from typing import Dict, Any, Optional

class CommandExecutor:
    """
    Executes validated commands (used by frontend, kept here for reference)
    """
    
    @staticmethod
    def execute(command: Dict[str, Any], current_code: str) -> str:
        """
        Execute a single command on the code
        Note: This is a reference implementation.
        The frontend handles actual execution for security.
        """
        action = command.get('action')
        
        if action == 'update_style':
            return CommandExecutor._update_style(current_code, command)
        elif action == 'update_text':
            return CommandExecutor._update_text(current_code, command)
        elif action == 'add_element':
            return CommandExecutor._add_element(current_code, command)
        elif action == 'remove_element':
            return CommandExecutor._remove_element(current_code, command)
        
        return current_code
    
    @staticmethod
    def _update_style(code: str, command: Dict[str, Any]) -> str:
        """Update style property"""
        target = command.get('target', 'body')
        property_name = command.get('property', '')
        value = command.get('value', '')
        
        import re
        pattern = f'<{target}[^>]*>'
        match = re.search(pattern, code, re.IGNORECASE)
        
        if match:
            tag = match.group(0)
            if 'style=' in tag:
                code = re.sub(
                    f'<{target}([^>]*)style="([^"]*)"',
                    f'<{target}\\1style="\\2; {property_name}: {value};"',
                    code,
                    flags=re.IGNORECASE
                )
            else:
                code = re.sub(
                    f'<{target}([^>]*)>',
                    f'<{target}\\1 style="{property_name}: {value};">',
                    code,
                    flags=re.IGNORECASE
                )
        
        return code
    
    @staticmethod
    def _update_text(code: str, command: Dict[str, Any]) -> str:
        """Update text content"""
        target = command.get('target', 'p')
        value = command.get('value', '')
        
        import re
        pattern = f'<{target}[^>]*>([^<]*)</{target}>'
        code = re.sub(pattern, f'<{target}>{value}</{target}>', code, flags=re.IGNORECASE)
        
        return code
    
    @staticmethod
    def _add_element(code: str, command: Dict[str, Any]) -> str:
        """Add new element"""
        element = command.get('element', '')
        parent = command.get('parent', 'body')
        
        import re
        pattern = f'</{parent}>'
        code = re.sub(pattern, f'{element}</{parent}>', code, flags=re.IGNORECASE)
        
        return code
    
    @staticmethod
    def _remove_element(code: str, command: Dict[str, Any]) -> str:
        """Remove element"""
        target = command.get('target', '')
        
        import re
        pattern = f'<{target}[^>]*>.*?</{target}>'
        code = re.sub(pattern, '', code, flags=re.IGNORECASE | re.DOTALL)
        
        return code
