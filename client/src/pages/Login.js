import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, x: -100 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: 100 }
};

const cardVariants = {
  initial: { opacity: 0, y: 50, scale: 0.9 },
  in: { opacity: 1, y: 0, scale: 1 },
  out: { opacity: 0, y: -50, scale: 0.95 }
};

const buttonVariants = {
  hover: { scale: 1.05, y: -3, boxShadow: "0 15px 40px rgba(59, 130, 246, 0.5)" },
  tap: { scale: 0.98 },
  initial: { scale: 1, y: 0, boxShadow: "0 4px 20px rgba(59, 130, 246, 0.4)" }
};

function Login(){

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [showPassword,setShowPassword] = useState(false);
const [error,setError] = useState("");
const [loading,setLoading] = useState(false);

const     login = async () => {
    if(!email || !password){
        setError("Please fill all fields");
        return;
    }
    setLoading(true);
    setError("");
    try {
        const res = await axios.post(
            "http://localhost:5000/api/auth/login",
            {email,password}
        );
        localStorage.setItem("token",res.data.token);
        localStorage.setItem("userId",res.data.userId);
        if (res.data.name) {
            localStorage.setItem("userName", res.data.name);
        }
        window.location="/dashboard";
    } catch (err) {
        setError(err.response?.data || "Login failed. Check your credentials.");
    }
    setLoading(false);
};

return(

<motion.div 
    initial="initial" 
    animate="in" 
    exit="out"
    variants={pageVariants}
    transition={{ duration: 0.4, ease: "easeInOut" }}
    style={{
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0f2847 100%)',
        position: 'relative',
        overflow: 'hidden',
        margin: 0,
        padding: 0
    }}
>
    <motion.div
        style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
            top: '-150px',
            right: '-100px',
            pointerEvents: 'none'
        }}
        animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity }}
    />
    <motion.div
        style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(96, 165, 250, 0.2) 0%, transparent 70%)',
            bottom: '-100px',
            left: '-100px',
            pointerEvents: 'none'
        }}
        animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
    />
    <motion.div 
        variants={cardVariants}
        initial="initial"
        animate="in"
        exit="out"
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
            padding: '48px', 
            background: 'rgba(13, 33, 55, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px', 
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        <motion.div 
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(96, 165, 250, 0.05) 100%)',
                pointerEvents: 'none'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
        />

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{textAlign: 'center', marginBottom: '40px'}}
        >
            <motion.div 
                animate={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                style={{fontSize: '56px', marginBottom: '16px'}}
            >🎯</motion.div>
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                    textAlign: 'center', 
                    marginBottom: '8px', 
                    color: '#fff',
                    fontSize: '32px',
                    fontWeight: '800'
                }}
            >
                Welcome Back
            </motion.h2>
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ color: 'rgba(96, 165, 250, 0.8)', fontSize: '14px' }}
            >
                Sign in to continue tracking your habits
            </motion.p>
        </motion.div>

        <AnimatePresence>
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        padding: '14px',
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: '#fca5a5',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        textAlign: 'center',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        fontWeight: '500',
                        overflow: 'hidden'
                    }}
                >
                    {error}
                </motion.div>
            )}
        </AnimatePresence>

        <div style={{marginBottom: '20px'}}>
            <input
                placeholder="📧 Email Address"
                type="email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                style={{
                    width: '100%', 
                    padding: '16px 20px', 
                    marginBottom: '16px', 
                    borderRadius: '12px', 
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    background: 'rgba(10, 22, 40, 0.8)',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.8)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                    e.target.style.boxShadow = 'none';
                }}
            />
        </div>

        <div style={{position: 'relative', marginBottom: '28px'}}>
            <input
                type={showPassword ? "text" : "password"}
                placeholder="🔐 Password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                style={{
                    width: '100%', 
                    padding: '16px 50px 16px 20px', 
                    marginBottom: '20px', 
                    borderRadius: '12px', 
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    background: 'rgba(10, 22, 40, 0.8)',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.8)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                    e.target.style.boxShadow = 'none';
                }}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                    position: 'absolute', 
                    right: '16px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    color: 'rgba(96, 165, 250, 0.7)',
                    padding: '0',
                    fontSize: '20px',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.target.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                    e.target.style.color = 'rgba(96, 165, 250, 0.7)';
                }}
            >
                {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
        </div>

        <motion.button 
            onClick={login} 
            disabled={loading}
            variants={buttonVariants}
            initial="initial"
            whileHover={!loading ? "hover" : "initial"}
            whileTap={!loading ? "tap" : "initial"}
            style={{
                width: '100%', 
                padding: '16px',
                background: loading 
                    ? 'rgba(59, 130, 246, 0.5)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                cursor: loading ? 'not-allowed' : 'pointer', 
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '24px',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <motion.span
                style={{ position: 'relative', zIndex: 1 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {loading ? "⏳ Loading..." : "🚀 Login"}
            </motion.span>
            {!loading && (
                <motion.div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '100px',
                        height: '100px',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none'
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 3, opacity: 0.2 }}
                    transition={{ duration: 0.3 }}
                />
            )}
        </motion.button>

        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
                textAlign: 'center', 
                color: 'rgba(96, 165, 250, 0.8)',
                fontSize: '15px',
                fontWeight: '500'
            }}
        >
            Don't have an account?{" "}
            <motion.span
                whileHover={{ scale: 1.1, color: "#fff" }}
                style={{ display: 'inline-block' }}
            >
                <Link to="/register" style={{
                    color: '#fff',
                    textDecoration: 'none',
                    fontWeight: '700',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.target.style.color = '#60a5fa';
                    e.target.style.textShadow = '0 0 10px rgba(96, 165, 250, 0.5)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.color = '#fff';
                    e.target.style.textShadow = 'none';
                }}
                >
                    Sign Up
                </Link>
            </motion.span>
        </motion.p>

    </motion.div>

</motion.div>

);

}

export default Login;
