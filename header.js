// Universal header for TTW Enterprises
// Include this file in any page with: <script src="header.js"></script>

document.addEventListener('DOMContentLoaded', function() {
    // Create header HTML
    const headerHTML = `
        <style>
            /* Navigation */
            nav {
                background: rgba(10, 10, 10, 0.95);
                border-bottom: 2px solid #c41e3a;
                padding: 1rem 2rem;
                position: sticky;
                top: 0;
                z-index: 100;
                backdrop-filter: blur(10px);
            }

            .nav-container {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .logo {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 1.5rem;
                font-weight: bold;
                color: #ffd700;
                text-decoration: none;
            }

            .logo span {
                color: #c41e3a;
            }

            .nav-links {
                display: flex;
                gap: 2rem;
                list-style: none;
            }

            .nav-links a {
                color: #f5f5f5;
                text-decoration: none;
                font-weight: 500;
                transition: all 0.3s ease;
                position: relative;
            }

            .nav-links a:hover {
                color: #ffd700;
            }

            .nav-links a::after {
                content: '';
                position: absolute;
                bottom: -5px;
                left: 0;
                width: 0;
                height: 2px;
                background: #c41e3a;
                transition: width 0.3s ease;
            }

            .nav-links a:hover::after {
                width: 100%;
            }

            @media (max-width: 768px) {
                .nav-links {
                    gap: 1rem;
                }
            }
        </style>
        <nav>
            <div class="nav-container">
                <a href="index.html" class="logo">
                    <span>TTW</span> ENTERPRISES
                </a>
                <ul class="nav-links">
                    <li><a href="index.html#audit">Free Audit</a></li>
                    <li><a href="email-subject-lines.html">Free Guide</a></li>
                    <li><a href="reviews.html">Reviews</a></li>
                    <li><a href="contact.html">Contact</a></li>
                </ul>
            </div>
        </nav>
    `;

    // Insert header at the beginning of body
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
});
