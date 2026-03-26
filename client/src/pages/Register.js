import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, x: 100 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -100 }
};

const cardVariants = {
  initial: { opacity: 0, y: 50, scale: 0.9 },
  in: { opacity: 1, y: 0, scale: 1 },
  out: { opacity: 0, y: -50, scale: 0.95 }
};

const buttonVariants = {
  hover: { scale: 1.05, y: -3, boxShadow: "0 15px 40px rgba(34, 197, 94, 0.5)" },
  tap: { scale: 0.98 },
  initial: { scale: 1, y: 0, boxShadow: "0 4px 20px rgba(34, 197, 94, 0.4)" }
};

function Register(){

const [name,setName] = useState("");
const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [gender,setGender] = useState("");
const [showPassword,setShowPassword] = useState(false);
const [error,setError] = useState("");
const [loading,setLoading] = useState(false);

const register = async () => {
    if(!name || !email || !password || !gender){
        setError("Please fill all fields including gender");
        return;
    }
    setLoading(true);
    setError("");
    try {
        const res = await axios.post(
            "http://localhost:5000/api/auth/register",
            {name,email,password}
        );
        if(res.data.message === "alreadyregistered"){
            setError("You are already registered! Please login.");
        } else {
            localStorage.setItem("userId", res.data.id);
            localStorage.setItem("userName", name);
            localStorage.setItem("userGender", gender);
            window.location="/dashboard";
        }
    } catch (err) {
        setError("Registration failed. Try again.");
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
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%)',
            bottom: '-150px',
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
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{textAlign: 'center', marginBottom: '40px'}}
        >
            <motion.div 
                animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                style={{fontSize: '56px', marginBottom: '16px'}}
            >🚀</motion.div>
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
                Create Account
            </motion.h2>
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ color: 'rgba(96, 165, 250, 0.8)', fontSize: '14px' }}
            >
                Start your habit tracking journey today
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

        <div style={{marginBottom: '16px'}}>
            <input
                placeholder="👤 Full Name"
                value={name}
                onChange={(e)=>setName(e.target.value)}
                style={{
                    width: '100%', 
                    padding: '16px 20px', 
                    marginBottom: '16px', 
                    borderRadius: '12px', 
                    border: '2px solid rgba(34, 197, 94, 0.3)',
                    background: 'rgba(10, 22, 40, 0.8)',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(34, 197, 94, 0.8)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.2)';
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(34, 197, 94, 0.3)';
                    e.target.style.boxShadow = 'none';
                }}
            />
        </div>

        <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block', color: 'rgba(96, 165, 250, 0.8)', fontSize: '14px', marginBottom: '12px', fontWeight: '500'}}>
                👤 Select Your Avatar Style
            </label>
            <div style={{display: 'flex', gap: '12px'}}>
                <div 
                    onClick={() => setGender('male')}
                    style={{
                        flex: 1,
                        padding: '16px',
                        borderRadius: '12px',
                        border: gender === 'male' ? '3px solid #22c55e' : '2px solid rgba(34, 197, 94, 0.3)',
                        background: gender === 'male' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(10, 22, 40, 0.8)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name || 'male'}&backgroundColor=0a1628&clothingColor=3b82f6`}
                        alt="Male Avatar" 
                        style={{width: '80px', height: '80px', margin: '0 auto 8px auto', display: 'block'}} 
                    />
                    <div style={{color: '#fff', fontSize: '14px', fontWeight: '600'}}>👨 Male</div>
                </div>
                <div 
                    onClick={() => setGender('female')}
                    style={{
                        flex: 1,
                        padding: '16px',
                        borderRadius: '12px',
                        border: gender === 'female' ? '3px solid #22c55e' : '2px solid rgba(34, 197, 94, 0.3)',
                        background: gender === 'female' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(10, 22, 40, 0.8)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <img 
                        src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${name || 'female'}&backgroundColor=0a1628`}
                        alt="Female Avatar" 
                        style={{width: '80px', height: '80px', margin: '0 auto 8px auto', display: 'block'}} 
                    />
                    <div style={{color: '#fff', fontSize: '14px', fontWeight: '600'}}>👩 Female</div>
                </div>
            </div>
        </div>

        <div style={{marginBottom: '16px'}}>
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
                    border: '2px solid rgba(34, 197, 94, 0.3)',
                    background: 'rgba(10, 22, 40, 0.8)',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(34, 197, 94, 0.8)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.2)';
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(34, 197, 94, 0.3)';
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
                    border: '2px solid rgba(34, 197, 94, 0.3)',
                    background: 'rgba(10, 22, 40, 0.8)',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(34, 197, 94, 0.8)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.2)';
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(34, 197, 94, 0.3)';
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
            onClick={register} 
            disabled={loading}
            variants={buttonVariants}
            initial="initial"
            whileHover={!loading ? "hover" : "initial"}
            whileTap={!loading ? "tap" : "initial"}
            style={{
                width: '100%', 
                padding: '16px',
                background: loading 
                    ? 'rgba(34, 197, 94, 0.5)'
                    : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
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
                {loading ? "⏳ Creating..." : "🚀 Sign Up"}
            </motion.span>
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
            Already have an account?{" "}
            <motion.span
                whileHover={{ scale: 1.1, color: "#fff" }}
                style={{ display: 'inline-block' }}
            >
                <Link to="/" style={{
                    color: '#fff',
                    textDecoration: 'none',
                    fontWeight: '700',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.target.style.color = '#22c55e';
                    e.target.style.textShadow = '0 0 20px rgba(34, 197, 94, 0.5)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.color = '#fff';
                    e.target.style.textShadow = 'none';
                }}
                >
                    Login
                </Link>
            </motion.span>
        </motion.p>

    </motion.div>

</motion.div>

);

}

export default Register;
