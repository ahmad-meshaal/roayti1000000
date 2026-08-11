import zipfile
import os

def create_complete_zip(output_zip_name):
    # Root directory
    root_dir = os.getcwd()
    
    # Exclude patterns
    exclude_dirs = {'node_modules', '.git', '.cache', '__pycache__', 'dist'}
    
    with zipfile.ZipFile(output_zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for current_root, dirs, files in os.walk(root_dir):
            # Filter out excluded directories in place
            dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]
            
            for file in files:
                # Exclude self zip files and hidden files
                if file.endswith('.zip') or file.endswith('.tar.gz') or file.startswith('.'):
                    continue
                
                full_path = os.path.join(current_root, file)
                rel_path = os.path.relpath(full_path, root_dir)
                
                zipf.write(full_path, rel_path)
                
    print(f"Archive '{output_zip_name}' created successfully with size: {os.path.getsize(output_zip_name)} bytes")

if __name__ == '__main__':
    create_complete_zip('roayti-complete-source.zip')
