import { login } from "../services/AuthService.js"

export const getLogin = (req, res) => {
    return res.render('auth/login', {
        layout: 'layouts/main_layout',
        title: 'E-Pemilwa',
        customCSS: '/css/login.css',
        successMessage : req.flash('success'),
        errorMessage : req.flash('error'),
    })
}

export const postLogin = async (req, res) => {
    const { nim, password } = req.body
    if (!nim || !password) {
        res.status(400)
        return console.log('Masukkan kredensial yang valid!')
    }
    try {
        const voter = await login(nim, password)
        res.cookie('jwt', voter, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 })
        req.flash('success', "Berhasil Masuk")
        return res.status(200).redirect('/dashboard')
    } catch (error) {
        req.flash('error', error.message)
        return res.status(400).redirect('/login')
    }
}

export const getLogout = (req, res) => {
    res.clearCookie('jwt')
    req.flash('success', "Berhasil keluar")
    return res.status(200).redirect('/')
}

