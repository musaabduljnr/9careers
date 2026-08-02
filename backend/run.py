import os
import sys
import uvicorn

# Ensure project root directory is in sys.path so 'backend' package imports resolve
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

if __name__ == "__main__":
    uvicorn.run("backend.app.presentation.main:app", host="127.0.0.1", port=8000, reload=True)
