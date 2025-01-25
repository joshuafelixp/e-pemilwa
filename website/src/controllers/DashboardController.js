import { getAccountData, getDashboardData } from "../services/DashboardService.js"

export const getDashboard = async (req, res) => {
    try {
        const dashboardData = await getDashboardData()
        return res.render('dashboard/dashboard', {
            layout: 'layouts/dashboard_layout',
            title: 'E-Pemilwa',
            customCSS: '/css/dashboard.css',
            successMessage : req.flash('success'),
            errorMessage : req.flash('error'),
            dashboard:  dashboardData
        })
    } catch (error) {
        res.status(500)
        console.log(error.message)
    }
}

export const getVote = (req, res) => {
    return res.render('dashboard/vote', {
        layout: 'layouts/dashboard_layout',
        title: 'E-Pemilwa',
        customCSS: '/css/vote.css',
        successMessage : req.flash('success'),
        errorMessage : req.flash('error'),
    })
}

export const getAccount = async (req, res) => {
    try {
        const accountData = await getAccountData(req.decoded.nim)
        return res.render('dashboard/account', {
            layout: 'layouts/dashboard_layout',
            title: 'E-Pemilwa',
            customCSS: '/css/account.css',
            account: accountData,
        })
    } catch (error) {
        res.status(500)
        console.log(error.message)
    }

}