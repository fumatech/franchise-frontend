import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "admin-lte/dist/css/adminlte.min.css";
import "./LoginPage.css";
import axios from "axios";
import Form from "react-bootstrap/Form";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loginType, setLoginType] = useState("admin"); // 'admin' or 'user'
  const [error, setError] = useState("");

  // Load stored email on component mount
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    const storedLoginType = localStorage.getItem("loginType");
    if (storedEmail) {
      setEmail(storedEmail);
      setRememberMe(true);
    }
    if (storedLoginType) {
      setLoginType(storedLoginType);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const endpoint =
        loginType === "admin"
          ? `https://fusionmastertech.com:8443/customer/login`
          : `${process.env.REACT_APP_BASE_URL}/user/login`;

      const response = await axios.post(
        endpoint,
        {
          email,
          password,
          userType: loginType,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.message === "Login successful") {
        // Store user information
        if (rememberMe) {
          localStorage.setItem("userEmail", email);
          localStorage.setItem("loginType", loginType);
        } else {
          localStorage.removeItem("userEmail");
          localStorage.removeItem("loginType");
        }

        sessionStorage.setItem("userEmail", email);
        sessionStorage.setItem("userType", loginType);

        // Handle tenant database connection
        const tenantDbName = response.data.tenantDbName;
        if (tenantDbName) {
          // Store tenant info in both localStorage and sessionStorage
          localStorage.setItem("tenantDbName", tenantDbName);
          sessionStorage.setItem("tenantDbName", tenantDbName);

          // Set default tenant header for all future requests
          axios.defaults.headers.common["X-TenantID"] = tenantDbName;

          // Verify tenant connection
          await verifyTenantConnection(tenantDbName);
        }

        window.location.href = "/fumaretail/Dashboard";
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (error) {
      setError("Login failed. Please check your credentials and try again.");
      console.error("Login error:", error);
    }
  };

  const verifyTenantConnection = async (tenantDbName) => {
    try {
      // Test the tenant connection
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/tenant/debug`,
        {
          withCredentials: true,
          headers: {
            "X-TenantID": tenantDbName,
          },
        }
      );
      console.log("Tenant connection verified:", response.data);
    } catch (err) {
      console.error("Tenant verification failed:", err);
      throw new Error("Failed to connect to tenant database");
    }
  };

  const testTenantConnection = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/tenant/debug`
      );
      console.log("Tenant debug:", res.data);
    } catch (err) {
      console.error("Tenant debug failed:", err);
    }
  };

  return (
    <div className="login_background">
      <div className="container-fluid h-100">
        <div className="row h-100 justify-content-center align-items-center">
          <div className="col-lg-6 login_backgroundimg d-none d-lg-flex align-items-center justify-content-center">
            <h1 className="login_img_text"></h1>
          </div>
          <div className="col-12 col-md-8 col-lg-6 col-xl-5 d-flex align-items-center justify-content-center p-0">
            <div className="login_box">
              <form onSubmit={handleSubmit} className="w-100">
                <div className="login_outer_borderbg">
                  <div className="inner_loginBox bg-transparent">
                    <p className="Register_With text-light">Franchise Login</p>

                    {/* Login Type Toggle */}
                    <div className="mb-3 text-center">
                      <div className="btn-group" role="group">
                        <button
                          type="button"
                          className={`btn ${
                            loginType === "admin"
                              ? "btn-primary"
                              : "btn-secondary"
                          }`}
                          onClick={() => setLoginType("admin")}
                        >
                          Admin Login
                        </button>
                        <button
                          type="button"
                          className={`btn ${
                            loginType === "user"
                              ? "btn-primary"
                              : "btn-secondary"
                          }`}
                          onClick={() => setLoginType("user")}
                        >
                          User Login
                        </button>
                      </div>
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <div className="row">
                      <div className="col-12">
                        <label className="ms-2 fs-5 titlew login-text">
                          Email
                        </label>
                        <div className="login_input_div">
                          <input
                            type="email"
                            placeholder="Your Email"
                            className="login_input text-light"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <label className="ms-2 fs-5 titlew login-text">
                          Password
                        </label>
                        <div className="login_input_div">
                          <input
                            type="password"
                            placeholder="Enter password"
                            className="login_input text-light"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="icheck-primary ms-3">
                        <Form.Check
                          className="login-text fw-semibold ms-4"
                          type="switch"
                          id="custom-switch"
                          label="Remember Me"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                      </div>
                      <button type="submit" className="login_signop_btn">
                        {loginType === "admin" ? "Admin Login" : "User Login"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
