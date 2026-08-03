import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.presentation.main import app
from backend.app.infrastructure.database import get_db, DBUser, Base
from backend.app.infrastructure.security import hash_password, create_access_token

@pytest.fixture(autouse=True)
def override_get_db(db_session: Session):
    Base.metadata.create_all(bind=db_session.get_bind())
    def _get_db_override():
        yield db_session
    app.dependency_overrides[get_db] = _get_db_override
    yield
    app.dependency_overrides.clear()


def test_admin_login_success(db_session: Session):
    client = TestClient(app)
    # Ensure admin@naijacareer.ai user exists
    db_user = db_session.query(DBUser).filter(DBUser.email == "admin@naijacareer.ai").first()
    if not db_user:
        db_user = DBUser(
            email="admin@naijacareer.ai",
            hashed_password=hash_password("AdminSecret123!"),
            full_name="System Admin",
            role="admin"
        )
        db_session.add(db_user)
        db_session.commit()

    response = client.post(
        "/api/v1/auth/admin/login",
        json={"email": "admin@naijacareer.ai", "password": "AdminSecret123!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"


def test_admin_route_forbidden_for_regular_user(db_session: Session):
    client = TestClient(app)
    # Create regular user
    regular_user = DBUser(
        email="regular_user@example.com",
        hashed_password=hash_password("Password123!"),
        full_name="Regular Candidate",
        role="user"
    )
    db_session.add(regular_user)
    db_session.commit()

    token = create_access_token(data={"sub": regular_user.email, "user_id": regular_user.id})
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt to access protected admin endpoint
    response = client.get("/api/v1/admin/dashboard/stats", headers=headers)
    assert response.status_code == 403
    assert "Admin authorization required" in response.json()["detail"]


def test_admin_route_allowed_for_admin_user(db_session: Session):
    client = TestClient(app)
    admin_user = db_session.query(DBUser).filter(DBUser.email == "admin@naijacareer.ai").first()
    if not admin_user:
        admin_user = DBUser(
            email="admin@naijacareer.ai",
            hashed_password=hash_password("AdminSecret123!"),
            full_name="System Admin",
            role="admin"
        )
        db_session.add(admin_user)
        db_session.commit()

    token = create_access_token(data={"sub": admin_user.email, "user_id": admin_user.id})
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/v1/admin/dashboard/stats", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_users" in data
