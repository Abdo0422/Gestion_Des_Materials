tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
                moroccan: {
                    blue: '#1D4E89',
                    teal: '#00A79D',
                    red: '#C73E3A',
                    gold: '#D4AF37',
                    sand: '#E2D0B2',
                }
            },
            fontFamily: {
                'sans': ['Poppins', 'sans-serif'],
            },
            backgroundImage: {
                'moroccan-pattern': "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCI+CjxyZWN0IHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iI2ZhZjVmZiI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwTDUwIDUwTTUwIDBMMCAzME0wIDIwTDUwIDUwTTAgNDBMNTAgME0wIDUwTDUwIDIwTTAgNTBMMzAgMCIgc3Ryb2tlPSIjMWQ0ZTg5IiBzdHJva2Utb3BhY2l0eT0iMC4wMiIgc3Ryb2tlLXdpZHRoPSIwLjUiPjwvcGF0aD4KPC9zdmc+')",
            }
        }
    }
}