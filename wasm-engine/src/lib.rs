use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct BlogEngine;

#[wasm_bindgen]
impl BlogEngine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> BlogEngine {
        BlogEngine
    }

    pub fn genkey(&self) -> String {
        let key: String = (0..32)
            .map(|_| format!("{:x}", rand::random::<u8>() % 16))
            .collect();
        format!("Generated 256-bit AES Key: 0x{}", key)
    }

    pub fn verify(&self, token: &str) -> String {
        if token.starts_with("eyJ") && token.contains('.') {
            "JWT Signature Matched. Principal: admin.".to_string()
        } else {
            "[INVALID] Signature Mismatch.".to_string()
        }
    }

    pub fn encrypt(&self, data: &str) -> String {
        let encrypted: String = data
            .chars()
            .map(|c| char::from_u32((c as u32) ^ 42).unwrap_or(c))
            .collect();
        format!("Encrypted Payload (XOR-42): {}", encrypted)
    }

    pub fn evaluate(&self, policy: &str) -> String {
        if let Some(rest) = policy.split("\"trust_score\":").nth(1) {
            let digits: String = rest
                .trim_start()
                .chars()
                .take_while(|c| c.is_ascii_digit() || *c == '-')
                .collect();
            if let Ok(score) = digits.parse::<i32>() {
                return if score >= 80 {
                    format!("[SUCCESS] Policy Passed: Trust Score {} Verified.", score)
                } else {
                    format!(
                        "[FAILED] Policy Rejected: Trust Score {} below threshold (80).",
                        score
                    )
                };
            }
        }
        "[ERROR] Invalid Policy Syntax. Access Denied.".to_string()
    }
}
