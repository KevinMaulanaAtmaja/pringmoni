---
description: Security audit with OWASP Top 10 vulnerability check
agent: security-auditor
subtask: true
---
# Security Audit Command

Perform a comprehensive security audit checking for OWASP Top 10 vulnerabilities.

## Audit Scope

$ARGUMENTS

## OWASP Top 10 Analysis

### A01: Broken Access Control
### A02: Cryptographic Failures
### A03: Injection
### A04: Insecure Design
### A05: Security Misconfiguration
### A06: Vulnerable Components
### A07: Authentication Failures
### A08: Software and Data Integrity Failures
### A09: Security Logging Failures
### A10: Server-Side Request Forgery (SSRF)

## Output Format

```
Security Audit Report
=====================
Scope: [files/directories audited]

CRITICAL FINDINGS:
HIGH SEVERITY:
MEDIUM SEVERITY:
LOW SEVERITY / INFORMATIONAL:

OWASP Coverage:
Recommendations:
```
