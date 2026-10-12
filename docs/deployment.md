# Cloud Deployment Architecture: AWS Hosting Guide

## 1. Architecture Diagram

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

## 2. Infrastructure Components

### A. Compute: AWS EC2 & Auto-Scaling Group
- **Instance Sizing**: `t4g.small` / `t4g.medium` (AWS Graviton3 ARM processors).
- **Application Server**: Gunicorn with Uvicorn workers (`uvicorn.workers.UvicornWorker`) managed by systemd on Ubuntu 24.04 LTS.
- **Frontend Serving**: Production build (`npm run build`) served via Nginx reverse proxy, proxying `/api/*`, `/login`, etc. to `127.0.0.1:8000`.
- **Auto-Scaling**: Deployed across 2 Availability Zones (AZs) behind an Application Load Balancer with CPU and health checks.

### B. Database: Amazon RDS for PostgreSQL
- **Engine**: PostgreSQL 16 with Multi-AZ replication.
- **Security**: Private subnets without public IP. Inbound access restricted to EC2 security group on port 5432.
- **Backups & Encryption**: Automated daily snapshots, point-in-time recovery (PITR) up to 35 days, encrypted via AWS KMS (AES-256).

### C. Storage: Amazon S3
- Bucket storage for patient scans, CAD models, and DICOM files.
- Server-side encryption via AWS KMS (`SSE-KMS`).
- S3 Block Public Access enabled; pre-signed URLs with expirations for access.

### D. Security Groups & Network Isolation (VPC)
- **ALB Security Group**: Inbound HTTPS (`443`) and HTTP (`80` $\rightarrow$ redirects to 443) from `0.0.0.0/0`.
- **EC2 Security Group**: Inbound port 80/8000 from ALB Security Group only. SSH disabled; management via AWS Systems Manager (SSM) Session Manager.
- **RDS Security Group**: Inbound port 5432 from EC2 Security Group only.

### E. Environment Secrets: AWS Secrets Manager
- `DATABASE_URL` and `SERVER_SECRET` stored in AWS Secrets Manager.
- IAM instance profile retrieves secrets at startup.

### F. Domain & SSL/TLS: Route 53 + ACM
- DNS routing via AWS Route 53.
- SSL/TLS certificates issued via AWS Certificate Manager (ACM), terminated at ALB with TLS 1.3.
