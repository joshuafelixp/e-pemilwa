export const getHome = (req, res) => {
    return res.render('home', {
        layout: 'layouts/main_layout',
        title: 'E-Pemilwa',
        customCSS: '/css/home.css',
        successMessage : req.flash('success'),
        errorMessage : req.flash('error'),
    })
}