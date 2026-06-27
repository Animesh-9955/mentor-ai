import os
import sys
import subprocess

PORT = 8080
HOST = "0.0.0.0"

if __name__ == "__main__":
    print("Initializing MentorAI Server Launcher...")
    
    # Absolute paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    venv_python = os.path.join(base_dir, ".venv", "bin", "python3")
    
    # Verify virtual environment
    if not os.path.exists(venv_python):
        print(f"Error: Python virtual environment not found at {venv_python}")
        print("Please verify dependencies setup step.")
        sys.exit(1)
        
    print(f"Launching FastAPI Server on http://{HOST}:{PORT}")
    print("Serving REST API endpoints and static assets...")
    
    # Run uvicorn inside virtual environment
    try:
        subprocess.run([
            venv_python, "-m", "uvicorn", "backend.main:app",
            "--host", HOST,
            "--port", str(PORT)
        ], cwd=base_dir)
    except KeyboardInterrupt:
        print("\nMentorAI Server shut down.")
        sys.exit(0)
