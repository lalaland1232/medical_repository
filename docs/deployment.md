# Cloud Deployment Architecture: AWS Hosting Guide

In this document, I outline how I would deploy and scale this Medical Case Management System in production on **Amazon Web Services (AWS)** to satisfy high-availability, HIPAA security requirements, and operational performance.

---

## 1. High-Level Architecture Diagram

```
                        [ Internet / Clinicians ]
                                   │
                                   ▼
                      [ AWS Route 53 (DNS) ]
                                   │
                                   ▼
                   [ AWS Certificate Manager (ACM) ]
                                   │ (HTTPS / TLS 1.3)
                                   ▼
                 [ Application Load Balancer (ALB) ]
                         │                   │
                 ┌───────┴───────┐   ┌───────┴───────┐
                 ▼               ▼   ▼               ▼
        [ EC2: FastAPI App ]     [ EC2: FastAPI App ] (Auto-Scaling Group)
                 │                       │
                 ├───────────────────────┤
                 │                       │
                 ▼                       ▼
      [ Amazon RDS: PostgreSQL ]    [ Amazon S3 ]
      (Multi-AZ Primary & Standby)  (Encrypted DICOM / Scans)
```

---

## 2. Infrastructure Components & My Configuration Choices

### A. Compute: AWS EC2 & Auto-Scaling Group
- **Instance Sizing**: `t4g.small` or `t4g.medium` (AWS Graviton3 ARM processors for cost-efficiency and high performance).
- **Application Server**: I configure **Gunicorn** with **Uvicorn workers** (`uvicorn.workers.UvicornWorker`) managed by **systemd** on Ubuntu 24.04 LTS.
- **Frontend Serving**: The React frontend is built into static files (`npm run build`) and served directly by **Nginx** as a reverse proxy, forwarding API requests (`/api/*`, `/login`, etc.) to the local FastAPI socket at `127.0.0.1:8000`.
- **Auto-Scaling**: Set up across 2 Availability Zones (AZs) behind an Application Load Balancer with CPU and latency health checks.

### B. Database: Amazon RDS for PostgreSQL
- **Engine**: PostgreSQL 16 with Multi-AZ replication enabled for automated failover.
- **Security**: Placed strictly in private subnets with no public IP address. Accessible only from the EC2 security group on port 5432.
- **Backups & Encryption**: Automated daily snapshots with point-in-time recovery (PITR) up to 35 days, encrypted at rest using **AWS KMS** (AES-256).

### C. Storage: Amazon S3 (Patient Scans & Implant CAD Files)
- When expanding the implant pipeline to support 3D CT scans, STL models, and surgical DICOM files, I store artifacts in an **Amazon S3** bucket.
- Server-side encryption enabled by default with **AWS KMS** (`SSE-KMS`).
- S3 Block Public Access enabled; files accessed exclusively through signed URLs with time-limited expirations.

### D. Security Groups & Network Isolation (VPC)
- **ALB Security Group**: Allows inbound HTTPS (`443`) and HTTP (`80` $\rightarrow$ redirects to 443) from `0.0.0.0/0`.
- **EC2 Security Group**: Allows inbound traffic on port 80/8000 *only* from the ALB Security Group. SSH port 22 is disabled in favor of **AWS Systems Manager (SSM) Session Manager**.
- **RDS Security Group**: Allows inbound PostgreSQL traffic on port 5432 *only* from the EC2 Security Group.

### E. Environment Secrets: AWS Secrets Manager
- I never commit `.env` or secrets into source control.
- In production, I store `DATABASE_URL` and `SERVER_SECRET` in **AWS Secrets Manager**.
- On instance launch, an IAM role attached to the EC2 instance retrieves secrets securely at runtime via the AWS CLI or boto3 SDK.

### F. Domain & SSL/TLS: Route 53 + ACM
- Domain DNS managed via **AWS Route 53**.
- Free SSL/TLS certificates issued and auto-renewed through **AWS Certificate Manager (ACM)**, terminated at the ALB with strict modern TLS 1.3 ciphers.
