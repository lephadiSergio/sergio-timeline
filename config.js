"use strict";

/*
 * Sergio's Timeline & Deliverables Dashboard
 *
 * Important:
 * The PIN below is visible in the public repository.
 * It is only a soft interface lock and must not protect sensitive information.
 */

window.SERGIO_DASHBOARD_CONFIG = {
    site: {
        title: "Sergio's Timeline & Deliverables Dashboard",
        owner: "Sergio Lephadi",
        description:
            "Engineering project and student council deliverables dashboard."
    },

    github: {
        username: "lephadiSergio",
        repository: "sergio-timeline",
        branch: "main"
    },

    admin: {
        pin: "2003",
        sessionKey: "sergioDashboardAdminUnlocked"
    },

    images: {
        profile: "assets/logos/ME.jpeg",
        eiesc: "assets/logos/eiesc.jpg",
        ebesc: "assets/logos/EBESCPICTURE.jpeg"
    },

    calendarEvents: [
        {
            date: "2026-07-20",
            title: "ELEN4000A/4011A Week 1 Supervisor Meeting",
            branch: "school"
        },
        {
            date: "2026-07-27",
            title: "ELEN4000A/4011A Week 2 Supervisor Meeting",
            branch: "school"
        },
        {
            date: "2026-09-16",
            title: "Wits EBE Energy Indaba — Day 1",
            branch: "ebesc"
        },
        {
            date: "2026-09-17",
            title: "Wits EBE Energy Indaba — Day 2",
            branch: "ebesc"
        }
    ],

    branches: [
        {
            id: "school",
            title: "ELEN4000A/4011A",
            subtitle: "Electrical Engineering Design Project",
            description:
                "Weekly project deliverables, supervisor meetings and final submission.",
            image: "assets/logos/ME.jpeg",
            items: [
                {
                    id: "school-week-1",
                    title: "Week 1 Deliverables",
                    description:
                        "Initial planning, site-selection research and first supervisor meeting.",
                    status: "completed",
                    dateLabel: "20–27 July 2026",
                    folder: "docs/school/week-1"
                },
                {
                    id: "school-week-2",
                    title: "Week 2 Deliverables",
                    description:
                        "Scope refinement, load profiles, security and community strategy.",
                    status: "completed",
                    dateLabel: "27 July–3 August 2026",
                    folder: "docs/school/week-2"
                },
                {
                    id: "school-week-3",
                    title: "Week 3 Deliverables",
                    description:
                        "Project research, analysis and design-development documents.",
                    status: "in-progress",
                    dateLabel: "Week 3",
                    folder: "docs/school/week-3"
                },
                {
                    id: "school-week-4",
                    title: "Week 4 Deliverables",
                    description:
                        "Design refinement, validation and progress documentation.",
                    status: "upcoming",
                    dateLabel: "Week 4",
                    folder: "docs/school/week-4"
                },
                {
                    id: "school-final-submission",
                    title: "Final Submission",
                    description:
                        "Final report, engineering documentation and supporting files.",
                    status: "upcoming",
                    dateLabel: "Final project submission",
                    folder: "docs/school/final-submission"
                }
            ]
        },

        {
            id: "eiesc",
            title: "EiESC",
            subtitle: "EIE School Council",
            description:
                "Electrical and Information Engineering Student Council activities.",
            image: "assets/logos/eiesc.jpg",
            items: [
                {
                    id: "eiesc-academic-awards",
                    title: "Academic Awards",
                    description:
                        "Academic Awards planning led by Wandile and Kwanele.",
                    status: "upcoming",
                    dateLabel: "Planning",
                    folder: "docs/eiesc/academic-awards"
                },
                {
                    id: "eiesc-gradball",
                    title: "Gradball",
                    description:
                        "Graduation Ball planning led by Joseph and Simphiwe.",
                    status: "in-progress",
                    dateLabel: "Planning",
                    folder: "docs/eiesc/gradball"
                }
            ]
        },

       {
    id: "ebesc",
    title: "EBESC",
    subtitle: "EBE Faculty Student Council",
    description:
        "Faculty council responsibilities, the 2026 Energy Indaba and the teams involved in planning it.",
    image: "assets/logos/EBESCPICTURE.jpeg",

    teams: [
        {
            title: "Marketing Team",
            note: "Handles publicity, promotions, visibility and communication for the Energy Indaba."
        },
        {
            title: "Sponsorship Team",
            note: "Handles sponsor outreach, partnerships, funding support and relationship management."
        },
        {
            title: "Planning Team",
            members: [
                "Sergio",
                "Emmanuel",
                "Khanyisani",
                "Mamosadi",
                "Ithuteng",
                "Ashwin",
                "Zimbini",
                "Moola",
                "Lerato",
                "Thandazo"
            ]
        }
    ],

    items: [
        {
            id: "indaba-invitations",
            title: "Minister Invitations",
            description:
                "Formal invitations to regional ministers and government representatives.",
            status: "completed",
            dateLabel: "Invitation stage",
            folder: "docs/ebesc/indaba/invitations"
        },
        {
            id: "indaba-shortlist",
            title: "Minister Shortlist",
            description:
                "Shortlisting and prioritisation of invited ministers and speakers.",
            status: "in-progress",
            dateLabel: "Shortlisting stage",
            folder: "docs/ebesc/indaba/shortlist"
        },
        {
            id: "indaba-booking",
            title: "Great Hall Booking",
            description:
                "Venue booking form, meeting minutes and operational requirements.",
            status: "in-progress",
            dateLabel: "Booking stage",
            folder: "docs/ebesc/indaba/booking"
        },
        {
            id: "indaba-tour",
            title: "School Invitation Tour",
            description:
                "Planning and documentation for the school invitation campaign.",
            status: "upcoming",
            dateLabel: "Outreach stage",
            folder: "docs/ebesc/indaba/tour"
        }
    ]
}
    ]
};
