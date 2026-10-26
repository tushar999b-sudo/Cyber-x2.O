use std::process::Command;
use std::fs;

// Tool 1: File padhne ke liye (Fixed Path)
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

// Tool 2: Terminal command chalane ke liye (Fixed Path)
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
            if out.status.success() {
                Ok(stdout)
            } else {
                Ok(format!("STDERR:\n{}", stderr))
            }
        },
        Err(e) => Err(format!("Failed to run command: {}", e)),
    }
}

// Tool 3: File likhne ke liye (Fixed Path)
#[tauri::command]
fn write_file(path: String, content: String) -> Result<String, String> {
    if path.starts_with("/") || path.contains("..") {
        return Err("Security Error: Absolute paths are not allowed. Use relative paths.".into());
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![read_file, run_command, write_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

