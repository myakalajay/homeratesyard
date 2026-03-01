# Project Structure

mortgage-platform-v3
├── ai-engine
│   ├── __pycache__
│   │   └── main.cpython-310.pyc
│   ├── downloads
│   ├── src
│   │   ├── __pycache__
│   │   │   └── __init__.cpython-310.pyc
│   │   ├── api
│   │   │   ├── __pycache__
│   │   │   │   ├── __init__.cpython-310.pyc
│   │   │   │   └── routes.cpython-310.pyc
│   │   │   ├── __init__.py
│   │   │   └── routes.py
│   │   ├── core
│   │   │   ├── __pycache__
│   │   │   │   ├── __init__.cpython-310.pyc
│   │   │   │   ├── chat_service.cpython-310.pyc
│   │   │   │   ├── knowledge_base.cpython-310.pyc
│   │   │   │   └── models.cpython-310.pyc
│   │   │   ├── __init__.py
│   │   │   ├── chat_service.py
│   │   │   ├── knowledge_base.py
│   │   │   └── models.py
│   │   ├── engines
│   │   │   └── aus
│   │   │       ├── anomaly
│   │   │       ├── insights
│   │   │       ├── rules
│   │   │       ├── scoring
│   │   │       └── decision.engine.js
│   │   ├── utils
│   │   │   ├── __init__.py
│   │   │   └── schemas.py
│   │   └── __init__.py
│   ├── chat_history.db
│   ├── Dockerfile
│   ├── main.py
│   └── requirements.txt
├── backend
│   ├── src
│   │   ├── config
│   │   │   ├── auth.config.js
│   │   │   ├── db.js
│   │   │   └── redis.js
│   │   ├── controllers
│   │   │   ├── admin.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── dashboard.controller.js
│   │   │   ├── document.controller.js
│   │   │   ├── loan.controller.js
│   │   │   ├── notification.controller.js
│   │   │   ├── payment.controller.js
│   │   │   ├── ticket.controller.js
│   │   │   └── user.controller.js
│   │   ├── middleware
│   │   │   ├── auditMiddleware.js
│   │   │   ├── authMiddleware.js
│   │   │   ├── fileUpload.js
│   │   │   ├── rateLimiter.js
│   │   │   └── validateRequest.js
│   │   ├── models
│   │   │   ├── AuditLog.js
│   │   │   ├── Document.js
│   │   │   ├── index.js
│   │   │   ├── Loan.js
│   │   │   ├── MagicLink.js
│   │   │   ├── Notification.js
│   │   │   ├── Payment.js
│   │   │   ├── Profile.js
│   │   │   ├── Repayment.js
│   │   │   ├── Session.js
│   │   │   ├── Ticket.js
│   │   │   ├── User.js
│   │   │   └── Wallet.js
│   │   ├── routes
│   │   │   ├── admin.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── dashboard.routes.js
│   │   │   ├── document.routes.js
│   │   │   ├── loan.routes.js
│   │   │   ├── notification.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── ticket.routes.js
│   │   │   └── user.routes.js
│   │   ├── seeders
│   │   │   └── seed.js
│   │   ├── services
│   │   │   ├── emailService.js
│   │   │   ├── notification.service.js
│   │   │   ├── payment.service.js
│   │   │   ├── pdf.service.js
│   │   │   ├── s3Service.js
│   │   │   └── underwriting.service.js
│   │   ├── templates
│   │   │   ├── auth
│   │   │   │   ├── reset-password.html
│   │   │   │   ├── verify-email.html
│   │   │   │   └── welcome.html
│   │   │   └── loans
│   │   │       ├── action-required.html
│   │   │       └── status-update.html
│   │   ├── utils
│   │   │   ├── AppError.js
│   │   │   └── jwt.js
│   │   ├── validations
│   │   │   ├── authValidation.js
│   │   │   └── loanValidation.js
│   │   └── app.js
│   ├── uploads
│   │   ├── avatars
│   │   └── documents
│   ├── .env
│   ├── Dockerfile
│   ├── package-lock.json
│   ├── package.json
│   ├── seedAdmin.js
│   └── server.js
├── frontend
│   ├── public
│   │   └── site.webmanifest
│   ├── src
│   │   ├── components
│   │   │   ├── application
│   │   │   │   ├── steps
│   │   │   │   │   ├── Step1Borrower.jsx
│   │   │   │   │   ├── Step2Property.jsx
│   │   │   │   │   ├── Step3Financials.jsx
│   │   │   │   │   ├── Step4Declarations.jsx
│   │   │   │   │   ├── Step5Review.jsx
│   │   │   │   │   └── Step6HMDA.jsx
│   │   │   │   └── index.js
│   │   │   ├── auth
│   │   │   │   └── RouteGuard.jsx
│   │   │   ├── charts
│   │   │   │   ├── InterestChart.jsx
│   │   │   │   ├── LoanBreakdownChart.jsx
│   │   │   │   ├── PaymentDonut.jsx
│   │   │   │   ├── PaymentScheduleChart.jsx
│   │   │   │   └── RevenueChart.jsx
│   │   │   ├── dashboard
│   │   │   │   └── views
│   │   │   │       ├── AdminDashboard.jsx
│   │   │   │       ├── BorrowerDashboard.jsx
│   │   │   │       ├── LenderDashboard.jsx
│   │   │   │       └── SuperAdminDashboard.jsx
│   │   │   ├── feedback
│   │   │   │   ├── ApiErrorBanner.jsx
│   │   │   │   ├── FormErrorSummary.jsx
│   │   │   │   └── SessionExpiredNotice.jsx
│   │   │   ├── forms
│   │   │   │   ├── loan
│   │   │   │   │   └── LoanApplicationForm.jsx
│   │   │   │   ├── CalculatorForm.jsx
│   │   │   │   ├── ContactForm.jsx
│   │   │   │   ├── ForgotPasswordForm.jsx
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── ResetPasswordForm.jsx
│   │   │   │   └── SignupForm.jsx
│   │   │   ├── layout
│   │   │   │   ├── dashboard
│   │   │   │   │   ├── Sidebar.jsx
│   │   │   │   │   ├── TopBar.jsx
│   │   │   │   │   └── UserMenu.jsx
│   │   │   │   ├── AppLayout.jsx
│   │   │   │   ├── AuthLayout.jsx
│   │   │   │   ├── DashboardLayout.jsx
│   │   │   │   ├── NotificationBell.jsx
│   │   │   │   ├── PageContainer.jsx
│   │   │   │   ├── PublicLayout.jsx
│   │   │   │   └── WizardLayout.jsx
│   │   │   ├── marketing
│   │   │   │   ├── calculator
│   │   │   │   │   └── index.js
│   │   │   │   ├── comparison
│   │   │   │   │   └── index.js
│   │   │   │   ├── cta
│   │   │   │   │   └── index.js
│   │   │   │   ├── feature
│   │   │   │   │   └── index.js
│   │   │   │   ├── hero
│   │   │   │   │   └── HeroEngine.js
│   │   │   │   ├── process
│   │   │   │   │   └── index.js
│   │   │   │   ├── stories
│   │   │   │   │   └── index.js
│   │   │   │   └── truststream
│   │   │   │       └── index.js
│   │   │   ├── modals
│   │   │   │   ├── ConfirmLoanModal.jsx
│   │   │   │   ├── ConversionModal.jsx
│   │   │   │   ├── DeleteAccountModal.jsx
│   │   │   │   └── LogoutModal.jsx
│   │   │   ├── navigation
│   │   │   │   ├── app
│   │   │   │   │   ├── AppNavbar.jsx
│   │   │   │   │   ├── AppSidebar.jsx
│   │   │   │   │   └── AppUserMenu.jsx
│   │   │   │   ├── shared
│   │   │   │   │   ├── LanguageSwitcher.jsx
│   │   │   │   │   ├── Logo.jsx
│   │   │   │   │   ├── NavLink.jsx
│   │   │   │   │   ├── TrustBadges.jsx
│   │   │   │   │   └── UserAvatar.jsx
│   │   │   │   ├── website
│   │   │   │   │   ├── WebsiteFooter.jsx
│   │   │   │   │   ├── WebsiteMobileNav.jsx
│   │   │   │   │   ├── WebsiteNavbar.jsx
│   │   │   │   │   └── WebsiteTopBar.jsx
│   │   │   │   └── index.js
│   │   │   ├── providers
│   │   │   │   ├── AuthProvider.jsx
│   │   │   │   └── LoanApplicationProvider.jsx
│   │   │   ├── ui
│   │   │   │   ├── data
│   │   │   │   │   ├── CircularProgress.jsx
│   │   │   │   │   ├── DataGrid.jsx
│   │   │   │   │   ├── EmptyState.jsx
│   │   │   │   │   ├── List.jsx
│   │   │   │   │   ├── ProgressBar.jsx
│   │   │   │   │   ├── Stat.jsx
│   │   │   │   │   └── Table.jsx
│   │   │   │   ├── feedback
│   │   │   │   │   ├── Alert.jsx
│   │   │   │   │   ├── InlineError.jsx
│   │   │   │   │   ├── Loader.jsx
│   │   │   │   │   ├── LocationStatus.jsx
│   │   │   │   │   ├── NotificationBanner.jsx
│   │   │   │   │   ├── Snackbar.jsx
│   │   │   │   │   └── Toast.jsx
│   │   │   │   ├── forms
│   │   │   │   │   ├── ErrorMessage.jsx
│   │   │   │   │   ├── FileUpload.jsx
│   │   │   │   │   ├── Form.jsx
│   │   │   │   │   ├── FormField.jsx
│   │   │   │   │   ├── HelperText.jsx
│   │   │   │   │   ├── Label.jsx
│   │   │   │   │   ├── OtpInput.jsx
│   │   │   │   │   └── SearchInput.jsx
│   │   │   │   ├── layout
│   │   │   │   │   ├── Container.jsx
│   │   │   │   │   ├── Footer.jsx
│   │   │   │   │   ├── Grid.jsx
│   │   │   │   │   ├── Header.jsx
│   │   │   │   │   ├── Section.jsx
│   │   │   │   │   ├── SidebarLayout.jsx
│   │   │   │   │   └── Stack.jsx
│   │   │   │   ├── media
│   │   │   │   │   ├── Carousel.jsx
│   │   │   │   │   ├── Icon.jsx
│   │   │   │   │   ├── Image.jsx
│   │   │   │   │   ├── ImageGallery.jsx
│   │   │   │   │   └── Video.jsx
│   │   │   │   ├── motion
│   │   │   │   │   ├── Accordion.jsx
│   │   │   │   │   ├── Collapsible.jsx
│   │   │   │   │   ├── Fade.jsx
│   │   │   │   │   ├── Scale.jsx
│   │   │   │   │   └── SlideOver.jsx
│   │   │   │   ├── navigation
│   │   │   │   │   ├── Breadcrumbs.jsx
│   │   │   │   │   ├── MobileNav.jsx
│   │   │   │   │   ├── Navbar.jsx
│   │   │   │   │   ├── Pagination.jsx
│   │   │   │   │   ├── Sidebar.jsx
│   │   │   │   │   ├── Stepper.jsx
│   │   │   │   │   └── Tabs.jsx
│   │   │   │   ├── overlay
│   │   │   │   │   ├── Backdrop.jsx
│   │   │   │   │   ├── Dialog.jsx
│   │   │   │   │   ├── Drawer.jsx
│   │   │   │   │   ├── Modal.jsx
│   │   │   │   │   ├── Popover.jsx
│   │   │   │   │   └── Tooltip.jsx
│   │   │   │   ├── primitives
│   │   │   │   │   ├── Avatar.jsx
│   │   │   │   │   ├── Badge.jsx
│   │   │   │   │   ├── Button.jsx
│   │   │   │   │   ├── Checkbox.jsx
│   │   │   │   │   ├── CurrencyInput.jsx
│   │   │   │   │   ├── Divider.jsx
│   │   │   │   │   ├── IconButton.jsx
│   │   │   │   │   ├── Input.jsx
│   │   │   │   │   ├── Radio.jsx
│   │   │   │   │   ├── Select.jsx
│   │   │   │   │   ├── Skeleton.jsx
│   │   │   │   │   ├── Spinner.jsx
│   │   │   │   │   ├── Switch.jsx
│   │   │   │   │   └── Textarea.jsx
│   │   │   │   ├── typography
│   │   │   │   │   ├── Blockquote.jsx
│   │   │   │   │   ├── CodeBlock.jsx
│   │   │   │   │   ├── Heading.jsx
│   │   │   │   │   ├── InlineCode.jsx
│   │   │   │   │   ├── Paragraph.jsx
│   │   │   │   │   └── Text.jsx
│   │   │   │   ├── FullScreenError.js
│   │   │   │   └── index.js
│   │   │   └── widgets
│   │   │       ├── ChatWidget.jsx
│   │   │       ├── EMIWidget.jsx
│   │   │       ├── HelpWidget.jsx
│   │   │       ├── RateComparisonWidget.jsx
│   │   │       └── SideStickyWidget.jsx
│   │   ├── config
│   │   │   ├── dashboardMenus.js
│   │   │   └── lendingRules.js
│   │   ├── context
│   │   │   ├── LocationContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── hooks
│   │   │   ├── useAuth.jsx
│   │   │   ├── useAxios.jsx
│   │   │   ├── useDebounce.jsx
│   │   │   ├── useLoanCalculator.jsx
│   │   │   ├── useMarketEngine.jsx
│   │   │   └── useToast.jsx
│   │   ├── lib
│   │   ├── pages
│   │   │   ├── admin
│   │   │   │   ├── loans
│   │   │   │   │   └── [id].js
│   │   │   │   ├── dashboard.js
│   │   │   │   ├── loans.js
│   │   │   │   └── users.js
│   │   │   ├── auth
│   │   │   │   ├── reset-password
│   │   │   │   │   └── [token].js
│   │   │   │   ├── forgot-password.js
│   │   │   │   ├── login.js
│   │   │   │   └── register.js
│   │   │   ├── dashboard
│   │   │   │   ├── application
│   │   │   │   │   ├── index.js
│   │   │   │   │   └── wizard.js
│   │   │   │   ├── notifications
│   │   │   │   │   └── index.js
│   │   │   │   ├── profile
│   │   │   │   │   └── index.js
│   │   │   │   ├── support
│   │   │   │   │   └── index.js
│   │   │   │   ├── documents.js
│   │   │   │   ├── index.js
│   │   │   │   └── settings.js
│   │   │   ├── super-admin
│   │   │   │   ├── loans
│   │   │   │   │   ├── [id].js
│   │   │   │   │   └── index.js
│   │   │   │   ├── users
│   │   │   │   │   └── index.js
│   │   │   │   ├── audit-logs.js
│   │   │   │   ├── health.js
│   │   │   │   └── index.js
│   │   │   ├── website
│   │   │   │   ├── calculators
│   │   │   │   │   ├── affordability.js
│   │   │   │   │   ├── amortization.js
│   │   │   │   │   ├── extra-payments.js
│   │   │   │   │   ├── index.js
│   │   │   │   │   ├── mortgage.js
│   │   │   │   │   ├── refinance.js
│   │   │   │   │   └── rent-vs-buy.js
│   │   │   │   ├── legal
│   │   │   │   │   ├── accessibility.js
│   │   │   │   │   ├── licenses.js
│   │   │   │   │   ├── privacy.js
│   │   │   │   │   └── terms.js
│   │   │   │   ├── loans
│   │   │   │   │   ├── arm.js
│   │   │   │   │   ├── compare.js
│   │   │   │   │   ├── conventional.js
│   │   │   │   │   ├── fha.js
│   │   │   │   │   ├── investors.js
│   │   │   │   │   ├── jumbo.js
│   │   │   │   │   ├── non-qm.js
│   │   │   │   │   ├── usda.js
│   │   │   │   │   └── va.js
│   │   │   │   ├── pre-approval
│   │   │   │   │   └── index.js
│   │   │   │   ├── refinance
│   │   │   │   │   ├── cash-out.js
│   │   │   │   │   ├── equity.js
│   │   │   │   │   ├── fha.js
│   │   │   │   │   ├── get-rates.js
│   │   │   │   │   ├── home.js
│   │   │   │   │   └── va.js
│   │   │   │   ├── about.js
│   │   │   │   ├── careers.js
│   │   │   │   ├── contact.js
│   │   │   │   ├── partners.js
│   │   │   │   ├── press.js
│   │   │   │   └── pricing.js
│   │   │   ├── _app.js
│   │   │   ├── _document.js
│   │   │   ├── 404.js
│   │   │   ├── 500.js
│   │   │   ├── construction.js
│   │   │   ├── index.js
│   │   │   ├── maintenance.js
│   │   │   └── offline.js
│   │   ├── services
│   │   │   ├── admin.service.js
│   │   │   ├── api.js
│   │   │   ├── auth.service.js
│   │   │   ├── calculation.service.js
│   │   │   ├── location.service.js
│   │   │   └── ticket.service.js
│   │   ├── styles
│   │   │   └── globals.css
│   │   └── utils
│   │       ├── api.js
│   │       ├── exportUtils.js
│   │       ├── mortgageCalculators.js
│   │       └── utils.js
│   ├── Dockerfile
│   ├── jsconfig.json
│   ├── next.config.js
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   └── tailwind.config.js
├── docker-compose.yml
└── structure.md
