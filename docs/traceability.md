# Requirements Traceability Matrix (RTM)

In medical software development, bidirectional traceability between system requirements, architecture implementation, and automated verification is essential.

I have documented the traceability matrix below linking every functional requirement to my backend code and automated tests.

---

## Traceability Matrix

| Requirement ID | Requirement Specification (Input) | My Architecture Implementation (Output) | Verification & Automated Test |
| :--- | :--- | :--- | :--- |
| **REQ-001** | **User Authentication & Session Management**: Authorized users shall log in with valid credentials, receive signed JWT tokens, and be able to revoke sessions on logout. | - `app/auth_endpoints/login/route.py`<br>- `app/auth_endpoints/login/service.py`<br>- `app/auth_endpoints/logout/service.py`<br>- `med_schema.sessions` | - `tests/test_logout.py::test_logout_flow`<br>- Verified with valid and invalid credentials in pytest. |
| **REQ-002** | **Role-Based Access Control (RBAC)**: System operations shall be restricted based on permissions stored in the database. Non-permitted operations must return HTTP 403 Forbidden. | - `app/security/security.py` (`get_permission`)<br>- `app/repository/repo.py` (`find_permission`)<br>- `med_schema.role_permissions` | - `tests/test_1.py`: Verified Viewer (Role 6) receives 403 when attempting status update.<br>- Verified Admin blocked from `/admin_sign_up` (403). |
| **REQ-003** | **Case Listing & Server Pagination**: Users shall be able to retrieve medical implant cases paginated by 10 per page, with server filtering by status, surgeon, or patient reference. | - `app/core_endpoints/cases/route.py` (`get_cases`)<br>- `app/core_endpoints/cases/repo.py` (`get_all_cases`, `get_cases_by_status`) | - Integration test: Queried 21 cases across Page 1 (10 items), Page 2 (10 items), and Page 3 (1 item). |
| **REQ-004** | **Case Creation & Validation**: Clinical administrators shall be able to register new surgical implant cases with unique Case ID, patient reference, surgeon, priority, and status. | - `app/core_endpoints/cases/route.py` (`create_case`)<br>- `app/schemas/case_schema.py` (`CreateCaseRequest`)<br>- Pydantic validators | - Integration test: `POST /create_case` with duplicate case or invalid field types tested and blocked with 422. |
| **REQ-005** | **Dedicated Status Transitions**: Permitted administrators shall update surgical planning phases through dedicated status patches. | - `app/core_endpoints/cases/route.py` (`update_status`)<br>- `app/schemas/case_schema.py` (`UpdateCaseRequest`) | - Integration test: Case status transition verified from `Planning` $\rightarrow$ `In Review`. |
| **REQ-006** | **Protected Case Deletion**: Only users with explicit `delete` permission (Admin/Superuser) shall permanently delete case records. Viewers must be blocked. | - `app/core_endpoints/cases/route.py` (`delete_case`)<br>- Guarded with `Depends(get_permission("delete"))` | - Integration test: Verified Viewer deletion attempt triggers HTTP 403; Admin deletion returns 200. |
| **REQ-007** | **Token Refresh & Rotation**: Expired access tokens shall be silently refreshed using valid refresh tokens, rotating session tokens to prevent replay attacks. | - `app/auth_endpoints/refresh_token/route.py`<br>- `app/auth_endpoints/refresh_token/service.py` | - `tests/test_logout.py`: Verified token rotation and rejection of revoked refresh tokens with 401. |
| **REQ-008** | **Superuser Admin Provisioning**: Only Superusers (Role 4) possessing `create_admin` shall provision new Clinical Administrators (Role 5). | - `app/auth_endpoints/admin_sign_up/route.py`<br>- Guarded with `Depends(get_permission("create_admin"))` | - Integration test: Verified Superuser receives 200; Admin receives 403 Permission Denied. |

---

## Verification Summary

All core requirements above are verified against my live FastAPI backend running with PostgreSQL. The security model ensures that permissions are always checked server-side, and client-side UI states simply provide user feedback while never acting as the authority.
