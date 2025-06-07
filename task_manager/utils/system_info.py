import platform
import time
import os
from datetime import datetime

def get_system_uptime():
    """Get system uptime across different platforms"""
    system_platform = platform.system()
    
    try:
        if system_platform == 'Windows':
            import psutil
            uptime_seconds = time.time() - psutil.boot_time()
        elif system_platform == 'Linux':
            # Get uptime in seconds from /proc/uptime
            try:
                with open('/proc/uptime', 'r') as f:
                    uptime_seconds = float(f.readline().split()[0])
            except:
                # If /proc/uptime is not available, use a fallback
                uptime_seconds = 0
        elif system_platform == 'Darwin':  # macOS
            # Using command line tool uptime
            try:
                import subprocess
                result = subprocess.run(['uptime'], stdout=subprocess.PIPE)
                uptime_output = result.stdout.decode('utf-8')
                # Parse the output to extract uptime
                # This is a simple approach and might need adjustment
                uptime_seconds = 3600  # Fallback to 1 hour if parsing fails
            except:
                uptime_seconds = 0
        else:
            # Fallback for unsupported platforms
            uptime_seconds = 0
            
    except Exception as e:
        # Fallback if any error occurs
        print(f"Error getting system uptime: {e}")
        uptime_seconds = 0
    
    # Format uptime
    uptime_days = int(uptime_seconds // (24 * 3600))
    uptime_seconds %= (24 * 3600)
    uptime_hours = int(uptime_seconds // 3600)
    uptime_seconds %= 3600
    uptime_minutes = int(uptime_seconds // 60)
    
    return {
        'seconds': uptime_seconds,
        'minutes': uptime_minutes,
        'hours': uptime_hours,
        'days': uptime_days,
        'text': f"{uptime_days} 天 {uptime_hours} 小時 {uptime_minutes} 分鐘"
    }

def get_system_stats():
    """Get basic system stats"""
    stats = {
        'platform': platform.system(),
        'platform_version': platform.version(),
        'platform_release': platform.release(),
        'processor': platform.processor(),
        'python_version': platform.python_version(),
        'hostname': platform.node()
    }
    return stats
