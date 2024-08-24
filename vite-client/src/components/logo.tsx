export function LOGO() {
    return <svg width="80" height="40" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">
        {/* <!-- Background --> */}
        <rect width="100%" height="100%" fill="#ffffff" />

        {/* <!-- Stylized Q --> */}
        <path d="M40 30 A45 45 0 1 1 40 120 L70 150" fill="none" stroke="#1a5f7a" stroke-width="12" />

        {/* <!-- Model representation --> */}
        <path d="M100 75 L150 30 L200 90 L250 45" fill="none" stroke="#1a5f7a" stroke-width="4" />
        <circle cx="150" cy="30" r="5" fill="#e63946" />
        <circle cx="200" cy="90" r="5" fill="#e63946" />

        {/* <!-- Chinese characters stylized --> */}
        <path d="M220 100 Q230 80 240 100 T260 100" fill="none" stroke="#1a5f7a" stroke-width="3" />
        <path d="M270 90 L280 110 M275 90 L275 110" stroke="#1a5f7a" stroke-width="3" />

        {/* <!-- Text --> */}
        <text x="90" y="140" font-family="Arial, sans-serif" font-weight="bold" font-size="24" fill="#1a5f7a">QModel</text>
        <text x="195" y="140" font-family="SimSun, serif" font-size="24" fill="#1a5f7a">轻策略</text>
    </svg>
}

export function LOGO2() {
    return <svg width="80" height="40" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0" />

        {/* <!-- Q letter --> */}
        <circle cx="50" cy="50" r="40" fill="#0066cc" />
        <path d="M70 70 L90 90" stroke="#0066cc" stroke-width="8" />

        {/* <!-- Stylized chart line --> */}
        <polyline points="110,80 130,40 150,60 170,20"
            stroke="#00aa55"
            stroke-width="4"
            fill="none" />

        {/* <!-- Text --> */}
        <text x="100" y="95" font-family="Arial, sans-serif" font-size="14" fill="#333333">QModel 轻策略</text>

    </svg>
}

export function LOGO3() {
    return <svg width="80" height="40" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">
        {/* <!-- Background --> */}
        <rect width="100%" height="100%" fill="#ffffff" />

        {/* <!-- Stylized Q --> */}
        <path d="M40 30 A45 45 0 1 1 40 120 L70 150" fill="none" stroke="#1a5f7a" stroke-width="12" />

        {/* <!-- Chinese characters stylized --> */}
        <path d="M180 40 Q200 20 220 40 T260 40" fill="none" stroke="#1a5f7a" stroke-width="5" />
        <path d="M270 25 L290 55 M280 25 L280 55" stroke="#1a5f7a" stroke-width="5" />

        {/* <!-- Text --> */}
        {/* <text x="90" y="100" font-family="Arial, sans-serif" font-weight="bold" font-size="36" fill="#1a5f7a">QModel</text> */}
        <text x="140" y="120" font-family="SimSun, serif" font-size="52" fill="#1a5f7a">轻策略</text>
    </svg>
}

export default LOGO3