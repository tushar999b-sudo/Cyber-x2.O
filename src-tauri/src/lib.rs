use std::process::Command;
use std::fs;

// Tool 1: File padhne ke liye
#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    match fs::read_to_string(&path) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("Failed to read file: {}", e)),
    }
}

// Tool 2: Terminal command chalane ke liye
#[tauri::command]
fn run_command(cmd: String) -> Result<String, String> {
    // Basic Safety check - kuch dangerous commands block karne ke liye
    if cmd.contains("rm -rf /") || cmd.contains("mkfs") || cmd.contains("dd if=") {
        return Err("Command blocked for safety reasons.".into());
    }

    // Arch Linux (Unix) ke liye
    let output = Command::new("sh").args(["-c", &cmd]).output();

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Yahan hum apne tools register kar rahe hain
        .invoke_handler(tauri::generate_handler![read_file, run_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
