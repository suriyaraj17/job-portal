import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [profilePic, setProfilePic] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const profileDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const loadPic = async () => {
      try {
        const endpoint = role === "seeker" ? "/accounts/profile/seeker/" : "/accounts/profile/employer/";
        const res = await api.get(endpoint);
        setProfilePic(role === "seeker" ? res.data.profile_pic : res.data.company_logo);
      } catch {
        setProfilePic(null);
      }
    };
    loadPic();
  }, [role]);

  useEffect(() => {
    const handler = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) setShowProfileMenu(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) setMobileMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const menuActions = {
    home: () => navigate(role === "seeker" ? "/seeker/dashboard" : "/employer/dashboard"),
    profile: () => navigate(role === "seeker" ? "/seeker/profile" : "/employer/profile"),
    settings: () => navigate(role === "seeker" ? "/seeker/account" : "/employer/settings"),
    applied: () => navigate("/seeker/applied-jobs")
  };

  return (
    <>
      <style>
        {`
          .nav-link-custom {
            position: relative;
            text-decoration: none !important;
            color: #4b5563 !important;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.2s ease;
          }
          .nav-link-custom:hover { color: #000 !important; }
          
          /* Mobile Menu Styling */
          .mobile-menu-container {
            position: absolute;
            top: 64px;
            left: 0;
            right: 0;
            background: white;
            border-bottom: 1px solid #eee;
            padding: 10px 15px 20px 15px;
            display: flex;
            flex-direction: column;
            gap: 4px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
            z-index: 1000;
            animation: slideDown 0.25s ease-out;
          }

          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .mobile-item {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            font-size: 15px;
            font-weight: 500;
            color: #374151;
            border-radius: 8px;
            transition: background 0.2s;
            text-decoration: none;
            border: none;
            background: transparent;
            width: 100%;
            text-align: left;
          }

          .mobile-item:active, .mobile-item:hover {
            background-color: #f3f4f6;
            color: #000;
          }

          .mobile-item i {
            font-size: 18px;
            margin-right: 12px;
            color: #6b7280;
          }
        `}
      </style>

      <nav className="navbar bg-white px-3 d-flex justify-content-between align-items-center" 
           style={{ borderBottom: "1px solid #eee", height: "64px", position: "sticky", top: 0, zIndex: 999 }}>
        
        <div className="d-flex align-items-center gap-3">
          <div className="fw-bold" style={{ cursor: "pointer", fontSize: "19px", letterSpacing: "-0.5px" }} onClick={menuActions.home}>
            JobPortal
          </div>
          
          <div className="d-none d-md-flex align-items-center gap-3 ms-3">
            <button className="btn p-0 nav-link-custom" onClick={menuActions.home}>Home</button>
            <button className="btn p-0 nav-link-custom" onClick={() => setShowAbout(true)}>About</button>
              <button
    className="btn p-0 nav-link-custom"
    onClick={() => navigate("/contact")}
  >
    Contact
  </button>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Desktop Actions */}
          <div className="d-none d-md-flex align-items-center gap-2">
            {role === "seeker" && (
              <button className="btn btn-light" style={{ border: "1px solid #f3f4f6", borderRadius: "8px" }} onClick={menuActions.applied}>
                <i className="bi bi-bookmark text-secondary"></i>
              </button>
            )}
            <button className="btn btn-light" style={{ border: "1px solid #f3f4f6", borderRadius: "8px" }} onClick={menuActions.settings}>
              <i className="bi bi-gear text-secondary"></i>
            </button>
            <div className="position-relative" ref={profileDropdownRef}>
              <button className="btn p-0 border-0" onClick={() => setShowProfileMenu(!showProfileMenu)} 
                      style={{ width: "34px", height: "34px", borderRadius: "50%", overflow: "hidden", border: "2px solid #f3f4f6" }}>
                <img src={profilePic ? `http://127.0.0.1:8000${profilePic}` : "https://cdn-icons-png.flaticon.com/512/847/847969.png"} 
                     alt="profile" width="34" height="34" style={{ objectFit: "cover" }} />
              </button>
              {showProfileMenu && (
                <div className="position-absolute bg-white shadow-sm rounded-3 p-1" style={{ top: "45px", right: "0px", width: "170px", border: "1px solid #eee" }}>
                  <button className="dropdown-item rounded-2 py-2" onClick={menuActions.profile}><i className="bi bi-person me-2"></i> Profile</button>
                  <button className="dropdown-item rounded-2 py-2 text-danger" onClick={logout}><i className="bi bi-box-arrow-right me-2"></i> Logout</button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Hamburger */}
          <div className="d-md-none" ref={mobileMenuRef}>
            <button className="btn border-0 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'} fs-4`}></i>
            </button>

            {mobileMenuOpen && (
              <div className="mobile-menu-container">
                <button className="mobile-item" onClick={() => { setMobileMenuOpen(false); menuActions.home(); }}>
                  <i className="bi bi-house"></i> Home
                </button>
                <button className="mobile-item" onClick={() => { setMobileMenuOpen(false); setShowAbout(true); }}>
                  <i className="bi bi-info-circle"></i> About Us
                </button>
                {role === "seeker" && (
                  <button className="mobile-item" onClick={() => { setMobileMenuOpen(false); menuActions.applied(); }}>
                    <i className="bi bi-bookmark"></i> Applied Jobs
                  </button>
                )}
                <button className="mobile-item" onClick={() => { setMobileMenuOpen(false); menuActions.profile(); }}>
                  <i className="bi bi-person"></i> My Profile
                </button>
                <button className="mobile-item" onClick={() => { setMobileMenuOpen(false); menuActions.settings(); }}>
                  <i className="bi bi-gear"></i> Account Settings
                </button>
                <hr className="my-2 mx-2 opacity-10" />
                <button className="mobile-item text-danger" onClick={logout}>
                  <i className="bi bi-box-arrow-right text-danger"></i> Sign Out
                </button>

                <button className="btn btn-link text-dark" onClick={() => navigate("/contact")}>
  Contact
</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* About Modal */}
      {showAbout && (
        <>
          <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered px-3">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px" }}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="fw-bold">About Us</h5>
                  <button className="btn-close" onClick={() => setShowAbout(false)}></button>
                </div>
                <div className="modal-body py-4 text-muted">
                  Job Portal helps job seekers find jobs and apply easily. We provide a seamless experience for both recruiters and candidates.
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" style={{ zIndex: 1040, backgroundColor: "rgba(0,0,0,0.3)" }}></div>
        </>
      )}
    </>
  );
}