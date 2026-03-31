import React, { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './Navbar';
import Footer from './Footer';
import GlobalChat from './GlobalChat';
import SocialLobby from './SocialLobby';

const MainLayout = ({ children }) => {
    const location = useLocation();
    const { isAuthenticated } = useSelector((state) => state.auth);
    
    // Define routes where elements should be hidden
    const isAuthRoute = ["/login", "/forgot-password", "/reset-password"].some(path => 
        location.pathname.startsWith(path)
    );
    
    // Hide navbar/social/footer in focused arena modes
    const isFocusedMode = [
        "/ide", 
        "/arena/", 
        "/spectate/",
        "/battle-room/"
    ].some(path => location.pathname.includes(path));

    const showNav = !isAuthRoute && !isFocusedMode;
    const showSocial = showNav && isAuthenticated;
    const showFooter = showNav;

    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-bg-dark)] selection:bg-[var(--color-primary)] selection:text-black">
            {showNav && (
                <Suspense fallback={null}>
                    <Navbar />
                </Suspense>
            )}

            {showSocial && (
                <Suspense fallback={null}>
                    <GlobalChat />
                    <SocialLobby />
                </Suspense>
            )}

            <main className={`flex-1 w-full mx-auto transition-all duration-300 ${showNav ? 'pt-20' : ''}`}>
                {children}
            </main>

            {showFooter && (
                <Suspense fallback={null}>
                    <Footer />
                </Suspense>
            )}
        </div>
    );
};

export default MainLayout;
