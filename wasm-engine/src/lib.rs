use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct BlogEngine;

#[wasm_bindgen]
impl BlogEngine {
    pub fn new() -> BlogEngine {
        BlogEngine
    }

    pub fn process_command(&self, cmd: &str) -> String {
        let parts: Vec<&str> = cmd.trim().split_whitespace().collect();
        if parts.is_empty() {
            return String::new();
        }

        match parts[0] {
            "genkey" => self.generate_mock_key(),
            "verify" => {
                if parts.len() < 2 {
                    "ERROR: Usage 'verify <token>'".to_string()
                } else {
                    self.verify_simulated_jwt(parts[1])
                }
            },
            "encrypt" => {
                if parts.len() < 2 {
                    "ERROR: Usage 'encrypt <data>'".to_string()
                } else {
                    self.mock_encrypt(parts[1])
                }
            },
            "evaluate" => {
                if parts.len() < 2 {
                    "ERROR: Usage 'evaluate <policy_json>'".to_string()
                } else {
                    self.evaluate_policy(parts[1])
                }
            },
            _ => "UNKNOWN_COMMAND: Redirecting to host engine...".to_string(),
        }
    }

    fn evaluate_policy(&self, policy_json: &str) -> String {
        if policy_json.contains("\"trust_score\":") {
            let score_part = policy_json.split("\"trust_score\":").collect::<Vec<&str>>()[1];
            let score_str = score_part.trim().split(',').collect::<Vec<&str>>()[0].trim().split('}').collect::<Vec<&str>>()[0].trim();
            if let Ok(score) = score_str.parse::<i32>() {
                if score >= 80 {
                    return "[SUCCESS] Policy Passed: Identity Verified.".to_string();
                } else {
                    return format!("[FAILED] Policy Rejected: Trust Score {} below threshold (80).", score);
                }
            }
        }
        "[ERROR] Invalid Policy Format. Principal context missing.".to_string()
    }

    fn generate_mock_key(&self) -> String {
        let key: String = (0..32)
            .map(|_| {
                let r = rand::random::<u8>() % 16;
                format!("{:x}", r)
            })
            .collect();
        format!("[SUCCESS] Generated 256-bit AES Key: 0x{}", key)
    }

    fn verify_simulated_jwt(&self, token: &str) -> String {
        if token.starts_with("eyJ") && token.contains(".") {
            "[VALID] JWT Signature Matched. Principal: admin. Scope: full-access.".to_string()
        } else {
            "[INVALID] Signature Mismatch or Malformed Token.".to_string()
        }
    }

    fn mock_encrypt(&self, data: &str) -> String {
        let encrypted: String = data.chars().map(|c| (c as u8 ^ 0x42) as char).collect();
        format!("[SUCCESS] Encrypted Payload (XOR-42): {}", encrypted)
    }
}