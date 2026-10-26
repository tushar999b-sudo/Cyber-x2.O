use std::process::Command;
use std::fs;

// Tool 1: File read karne ke liye
#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    let mut target_path = std::env::current_dir().unwrap_or_default();
    if target_path.ends_with("src-tauri") {
        target_path.pop();
    }
    let full_path = target_path.join(&path);

    match fs::read_to_string(&full_path) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("Failed to read file: {}", e)),
    }
}

// Tool 2: Terminal command chalane ke liye
#[tauri::command]
fn run_command(cmd: String) -> Result<String, String> {
    if cmd.contains("rm -rf /") || cmd.contains("mkfs") || cmd.contains("dd if=") {
        return Err("Command blocked for safety reasons.".into());
    }

    let mut target_path = std::env::current_dir().unwrap_or_default();
    if target_path.ends_with("src-tauri") {
        target_path.pop();
    }

    let output = Command::new("sh")
        .current_dir(target_path)
        .args(["-c", &cmd])
        .output();

    match output {
        Ok(out) => {
            let stdout = String::from_utf8_lossy(&out.stdout).to_string();
            let stderr = String::from_utf8_lossy(&out.stderr).to_string();
            
            // Empty output handling (jisse AI confuse na ho)
            if out.status.success() {
                if stdout.trim().is_empty() {
                    Ok("Command executed successfully. (No output)".into())
                } else {
                    Ok(stdout)
                }
            } else {
                if stderr.trim().is_empty() {
                    Ok(format!("Command failed with exit code: {:?}", out.status.code()))
                } else {
                    Ok(format!("STDERR:\n{}", stderr))
                }
            }
        },
        Err(e) => Err(format!("Failed to run command: {}", e)),
    }
}

// Tool 3: File write karne ke liye
#[tauri::command]
fn write_file(path: String, content: String) -> Result<String, String> {
    if path.starts_with("/") || path.contains("..") {
        return Err("Security Error: Absolute paths are not allowed.".into());
    }
    
    let mut target_path = std::env::current_dir().unwrap_or_default();
    if target_path.ends_with("src-tauri") {
        target_path.pop();
    }
    let full_path = target_path.join(&path);
    
    match fs::write(&full_path, content) {
        Ok(_) => Ok(format!("Successfully wrote to file: {}", path)),
        Err(e) => Err(format!("Failed to write file: {}", e)),
    }
}

// Tool 4: System Info nikalne ke liye
#[tauri::command]
fn system_info() -> Result<String, String> {
    let os = Command::new("sh").args(["-c", "uname -a"]).output().map(|o| String::from_utf8_lossy(&o.stdout).to_string()).unwrap_or_default();
    let disk = Command::new("sh").args(["-c", "df -h | head -n 5"]).output().map(|o| String::from_utf8_lossy(&o.stdout).to_string()).unwrap_or_default();
    let ram = Command::new("sh").args(["-c", "free -h"]).output().map(|o| String::from_utf8_lossy(&o.stdout).to_string()).unwrap_or_default();
    
    Ok(format!("OS/Kernel:\n{}\n\nDisk Space:\n{}\n\nRAM:\n{}", os, disk, ram))
}

// Tool 5: Directory List karne ke liye
#[tauri::command]
fn list_directory(path: String) -> Result<String, String> {
    let mut target_path = std::env::current_dir().unwrap_or_default();
    if target_path.ends_with("src-tauri") {
        target_path.pop();
    }
    
    let dir_path = if path.is_empty() || path == "." { target_path } else { target_path.join(&path) };
    
    let mut result = String::new();
    if let Ok(entries) = fs::read_dir(dir_path) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                let size = if metadata.is_dir() { "DIR".to_string() } else { format!("{} B", metadata.len()) };
                let name = entry.file_name().to_string_lossy().to_string();
                result.push_str(&format!("[{}]  {}\n", size, name));
            }
        }
        Ok(result)
    } else {
        Err(format!("Failed to read directory: {}", path))
    }
}

// Tool 6: Network Info ke liye
#[tauri::command]
fn network_info() -> Result<String, String> {
    let ip = Command::new("sh").args(["-c", "ip -brief a"]).output().map(|o| String::from_utf8_lossy(&o.stdout).to_string()).unwrap_or_default();
    let ports = Command::new("sh").args(["-c", "ss -tuln | head -n 10"]).output().map(|o| String::from_utf8_lossy(&o.stdout).to_string()).unwrap_or_default();
    
    Ok(format!("Network Interfaces:\n{}\n\nOpen Ports (Listening):\n{}", ip, ports))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_file, 
            run_command, 
            write_file,
            system_info,
            list_directory,
            network_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
