import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Add TypeScript declarations for Google Identity Services
if (typeof window !== 'undefined') {
    window.google = window.google || {};
    window.google.accounts = window.google.accounts || {};
    window.google.accounts.id = window.google.accounts.id || {};

    // Ensure the id object has the required methods
    if (!window.google.accounts.id.initialize) {
        window.google.accounts.id.initialize = () => { };
    }
    if (!window.google.accounts.id.renderButton) {
        window.google.accounts.id.renderButton = () => { };
    }
    if (!window.google.accounts.id.prompt) {
        window.google.accounts.id.prompt = () => { };
    }
}

const Login = () => {
    const { login, loginWithGoogle, register, loading, error, clearError } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        companyName: ''
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');
    const [googleLoaded, setGoogleLoaded] = useState(false);
    const [googleError, setGoogleError] = useState('');



    // Google OAuth client ID - you'll need to set this up in your Google Cloud Console
    const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com';



    const handleGoogleCredentialResponse = useCallback(async (response) => {
        setErrors({});
        setSuccess('');
        clearError();

        try {
            // Use the AuthContext loginWithGoogle function
            const result = await loginWithGoogle(response.credential);
            if (!result.success) {
                throw new Error(result.error);
            }

            setSuccess(result.isNewUser ?
                'Welcome! Your account has been created with Google.' :
                'Successfully logged in with Google!'
            );
        } catch (error) {
            console.error('Google login failed:', error);
            setErrors({ general: 'Google login failed. Please try again.' });
        }
    }, [loginWithGoogle, clearError]);

    // Validation functions
    const validateEmail = (email) => {
        if (!email.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Please enter a valid email address';
        return '';
    };

    const validatePassword = (password) => {
        if (!password) return 'Password is required';
        if (password.length < 8) return 'Password must be at least 8 characters long';
        if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
        if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
        if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
        if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) return 'Password must contain at least one special character';
        return '';
    };

    const validateName = (name, fieldName) => {
        if (!name.trim()) return `${fieldName} is required`;
        if (name.trim().length < 2) return `${fieldName} must be at least 2 characters long`;
        if (name.trim().length > 100) return `${fieldName} must be less than 100 characters long`;
        return '';
    };

    const validateCompanyName = (companyName) => {
        if (companyName && companyName.length > 255) return 'Company name must be less than 255 characters';
        return '';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear field-specific error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }

        setSuccess('');
        clearError();
    };

    const validateForm = () => {
        const newErrors = {};

        // Email validation
        const emailError = validateEmail(formData.email);
        if (emailError) newErrors.email = emailError;

        // Password validation
        const passwordError = validatePassword(formData.password);
        if (passwordError) newErrors.password = passwordError;

        // Registration-specific validation
        if (!isLogin) {
            const firstNameError = validateName(formData.firstName, 'First name');
            if (firstNameError) newErrors.firstName = firstNameError;

            const lastNameError = validateName(formData.lastName, 'Last name');
            if (lastNameError) newErrors.lastName = lastNameError;

            const companyNameError = validateCompanyName(formData.companyName);
            if (companyNameError) newErrors.companyName = companyNameError;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccess('');
        clearError();

        // Validate form before submission
        if (!validateForm()) {
            return;
        }

        if (isLogin) {
            const result = await login(formData.email, formData.password);
            if (!result.success) {
                // The error is now handled by AuthContext, but we can still set local error for consistency
                setErrors({ general: result.error });
            }
        } else {
            // Registration
            const result = await register(formData);
            if (!result.success) {
                // The error is now handled by AuthContext, but we can still set local error for consistency
                setErrors({ general: result.error });
            } else {
                setSuccess('Registration successful! You are now logged in.');
            }
        }
    };

    // Initialize Google Identity Services
    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 50; // 5 seconds max wait

        // Check if Google Identity Services is fully loaded
        const isGoogleLoaded = () => {
            return window.google &&
                window.google.accounts &&
                window.google.accounts.id &&
                typeof window.google.accounts.id.initialize === 'function';
        };



        // Initialize Google Sign-In with isolated DOM management
        const initializeGoogleSignIn = () => {
            try {
                if (!isGoogleLoaded()) {
                    console.warn('⚠️ Google Identity Services not ready yet');
                    return;
                }

                const buttonId = `google-signin-button-${isLogin ? 'login' : 'register'}`;
                const googleButton = document.getElementById(buttonId);

                if (!googleButton) {
                    console.warn('⚠️ Google button container not found');
                    return;
                }

                // Clear loading content
                googleButton.innerHTML = '';

                // Initialize Google with error handling
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleCredentialResponse,
                    auto_select: false,
                    cancel_on_tap_outside: true,
                });

                // Render button
                window.google.accounts.id.renderButton(googleButton, {
                    theme: 'outline',
                    size: 'large',
                    text: isLogin ? 'continue_with' : 'signup_with',
                    shape: 'rectangular',
                    width: '100%'
                });

                setGoogleLoaded(true);
                setGoogleError('');
                console.log('✅ Google Identity Services initialized successfully');

            } catch (error) {
                console.error('❌ Failed to initialize Google Identity Services:', error);
                setGoogleError('Google Sign-in is currently unavailable. Please use email and password instead.');
                setGoogleLoaded(false);
            }
        };

        // Wait for Google script to fully load
        const waitForGoogle = () => {
            if (isGoogleLoaded()) {
                // Check if button container exists and initialize
                const buttonId = `google-signin-button-${isLogin ? 'login' : 'register'}`;
                const googleButton = document.getElementById(buttonId);

                if (googleButton && !googleLoaded) {
                    initializeGoogleSignIn();
                }
                return;
            }

            retryCount++;
            if (retryCount >= maxRetries) {
                console.error('❌ Google Identity Services failed to load after 5 seconds');
                setGoogleError('Google Sign-in failed to load. Please use email and password instead.');
                setGoogleLoaded(false);
                return;
            }

            // Wait 100ms and try again
            setTimeout(waitForGoogle, 100);
        };

        // Start waiting for Google Identity Services
        waitForGoogle();

        // Cleanup function
        return () => {
            retryCount = maxRetries; // Stop retries if component unmounts
            setGoogleLoaded(false);
            setGoogleError('');
        };
    }, [isLogin, GOOGLE_CLIENT_ID, handleGoogleCredentialResponse]);

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setErrors({});
        setSuccess('');
        clearError();

        // Reset Google state for new mode
        setGoogleLoaded(false);

        setFormData({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            companyName: ''
        });
    };

    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        },
        card: {
            background: 'white',
            borderRadius: '12px',
            padding: '40px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '400px'
        },
        header: {
            textAlign: 'center',
            marginBottom: '30px'
        },
        logo: {
            width: '60px',
            height: '60px',
            marginBottom: '20px'
        },
        title: {
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '10px'
        },
        subtitle: {
            color: '#666',
            fontSize: '16px'
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        inputGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },
        label: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#333'
        },
        input: {
            padding: '12px 16px',
            border: '2px solid #e1e5e9',
            borderRadius: '8px',
            fontSize: '16px',
            transition: 'border-color 0.3s ease',
            outline: 'none'
        },
        inputError: {
            borderColor: '#dc3545'
        },
        fieldError: {
            color: '#dc3545',
            fontSize: '12px',
            marginTop: '4px',
            marginLeft: '4px'
        },
        button: {
            padding: '14px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            marginTop: '10px'
        },
        googleButton: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px',
            background: 'white',
            border: '2px solid #e1e5e9',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginTop: '10px'
        },
        divider: {
            display: 'flex',
            alignItems: 'center',
            margin: '30px 0',
            color: '#666',
            fontSize: '14px'
        },
        dividerLine: {
            flex: 1,
            height: '1px',
            background: '#e1e5e9'
        },
        dividerText: {
            padding: '0 15px'
        },
        error: {
            background: '#fee',
            color: '#c33',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            border: '1px solid #fcc',
            marginBottom: '20px'
        },
        success: {
            background: '#efe',
            color: '#363',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            border: '1px solid #cfc',
            marginBottom: '20px'
        },
        toggle: {
            textAlign: 'center',
            marginTop: '20px',
            color: '#666',
            fontSize: '14px'
        },
        toggleLink: {
            color: '#667eea',
            cursor: 'pointer',
            fontWeight: '600',
            textDecoration: 'none'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <img src="/logo.png" alt="PayLens" style={styles.logo} />
                    <h1 style={styles.title}>PayLens</h1>
                    <p style={styles.subtitle}>
                        {isLogin ? 'Sign in to your account' : 'Create your account'}
                    </p>
                </div>

                {(errors.general || error) && <div style={styles.error}>{errors.general || error}</div>}
                {googleError && <div style={{ ...styles.error, background: '#fff3cd', color: '#856404', borderColor: '#ffeaa7' }}>{googleError}</div>}
                {success && <div style={styles.success}>{success}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    {!isLogin && (
                        <>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>First Name *</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    style={{
                                        ...styles.input,
                                        ...(errors.firstName ? styles.inputError : {})
                                    }}
                                    required={!isLogin}
                                    placeholder="Enter your first name"
                                />
                                {errors.firstName && <div style={styles.fieldError}>{errors.firstName}</div>}
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Last Name *</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    style={{
                                        ...styles.input,
                                        ...(errors.lastName ? styles.inputError : {})
                                    }}
                                    required={!isLogin}
                                    placeholder="Enter your last name"
                                />
                                {errors.lastName && <div style={styles.fieldError}>{errors.lastName}</div>}
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Company Name (Optional)</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleInputChange}
                                    style={{
                                        ...styles.input,
                                        ...(errors.companyName ? styles.inputError : {})
                                    }}
                                    placeholder="Enter your company name"
                                />
                                {errors.companyName && <div style={styles.fieldError}>{errors.companyName}</div>}
                            </div>
                        </>
                    )}

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            style={{
                                ...styles.input,
                                ...(errors.email ? styles.inputError : {})
                            }}
                            required
                            placeholder="Enter your email"
                        />
                        {errors.email && <div style={styles.fieldError}>{errors.email}</div>}
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            style={{
                                ...styles.input,
                                ...(errors.password ? styles.inputError : {})
                            }}
                            required
                            placeholder="Enter your password"
                            minLength="8"
                        />
                        {errors.password && <div style={styles.fieldError}>{errors.password}</div>}
                    </div>

                    <button
                        type="submit"
                        style={styles.button}
                        disabled={loading}
                        onMouseOver={(e) => {
                            if (!loading) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                            }
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div style={styles.divider}>
                    <div style={styles.dividerLine}></div>
                    <span style={styles.dividerText}>or</span>
                    <div style={styles.dividerLine}></div>
                </div>

                {!googleError && (
                    <div
                        style={{
                            ...styles.googleButton,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '40px',
                            opacity: loading ? 0.6 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            pointerEvents: loading ? 'none' : 'auto'
                        }}
                        ref={(el) => {
                            if (el && !el.hasAttribute('data-google-init')) {
                                el.setAttribute('data-google-init', 'true');
                                const buttonId = `google-signin-button-${isLogin ? 'login' : 'register'}`;

                                // Create a completely isolated container
                                const googleContainer = document.createElement('div');
                                googleContainer.id = buttonId;
                                googleContainer.style.width = '100%';
                                googleContainer.style.display = 'flex';
                                googleContainer.style.justifyContent = 'center';
                                googleContainer.style.alignItems = 'center';
                                googleContainer.style.minHeight = '40px';

                                // Add loading indicator
                                if (!googleLoaded) {
                                    googleContainer.innerHTML = '<div style="display: flex; align-items: center; gap: 8px;"><span>🔄</span><span>Loading Google Sign-in...</span></div>';
                                }

                                // Replace React-managed content with isolated container
                                el.innerHTML = '';
                                el.appendChild(googleContainer);

                                // Mark as initialized to prevent re-initialization
                                el.setAttribute('data-google-ready', 'true');
                            }
                        }}
                    />
                )}

                <div style={styles.toggle}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span style={styles.toggleLink} onClick={toggleMode}>
                        {isLogin ? 'Create one here' : 'Sign in here'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Login;
