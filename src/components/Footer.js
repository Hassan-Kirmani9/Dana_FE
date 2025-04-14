import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={{
            bottom: 0,
            left: 0,
            right: 0,
            color: '#9CA3AF',
            textAlign: 'center',
            padding: '0.75rem',
            fontSize: '0.875rem',
            zIndex: 50,
            // background: "linear-gradient(45deg, #000000, #300030, #4d0014, #200020)"
            background: "linear-gradient(ellipse at center, #DC143C 0%, #300040 50%, #000000 80%)"
            

        }}
            className=''>
            © {currentYear} Designed and Developed By{' '}
            <a
                href="https://5cube.io"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    fontWeight: 700,
                    color: '#A855F7',
                    textDecoration: 'none',
                    cursor: 'pointer'
                }}
                onMouseOver={(e) => e.target.style.color = '#9333EA'}
                onMouseOut={(e) => e.target.style.color = '#A855F7'}
            >
                5Cube
            </a>
        </footer>
    );
};

export default Footer;