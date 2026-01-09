/* eslint-disable */
import { DateTime } from 'luxon';


const now = DateTime.now();

export const project = {
    githubIssues      : {

        labels  : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        series  : {
            'this-week': [
                {
                    name: 'Pin',
                    type: 'line',
                    data: [4200, 2800, 4300, 3400, 2000, 2500, 2200],
                },
                {
                    name: 'OTP',
                    type: 'column',
                    data: [1010, 1000, 800, 1100, 800, 1000, 1700],
                },
            ],

        },
    },
    githubIssuest      : {
  
        labels  : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        series  : {
            'this-week': [
                {
                    name: 'Pin',
                    type: 'line',
                    data: [20, 80, 30, 40, 20, 50, 20],
                },
                {
                    name: 'OTP',
                    type: 'column',
                    data: [101, 100, 80, 110, 80, 100, 170],
                },
            ],

        },
    },
    budgetDistribution: {
        categories: ['Concept', 'Design', 'Development', 'Extras', 'Marketing'],
        series    : [
            {
                name: 'Budget',
                data: [12, 20, 28, 15, 25],
            },
        ],
    },
    
};
