/// <reference types = "cypress" />

beforeEach(()=>{

    cy.visit('http://localhost:3000/');

})

it ('Test 1', ()=>{
    
    cy.intercept('https://www.reddit.com/r/all/new.json').as('testLoadAllMainRouteWithoutSubreddit') ;
    cy.wait('@testLoadAllMainRouteWithoutSubreddit').then((interception) =>{

        const response = interception.response?.statusCode;
        expect(response).to.eq(200);

        let pagination = interception.response?.body.data.dist;

        for (let i=1;i<=pagination;i++)
                cy.get(`:nth-child(${i}) > .author`).should('contain','posted to /r');              //checking if main route  adds 'posted to /r' to the author line
   
    });
})

it.only ('Test 2', ()=>{

    let subr = 'crypto';

    cy.intercept(`https://www.reddit.com/r/${subr}/new.json`).as('testLoadSearchedSubredditPost');
    cy.get('.subreddit-input').type(subr);
    cy.get('button').click();
    
    cy.wait('@testLoadSearchedSubredditPost').then((interception) =>{

        const response = interception.response?.statusCode;
        expect(response).to.eq(200);                                                                                                                        //Checking of response code to verify successful api call

        cy.get('div').should('have.class','post')                                                                                                           //Checking if subreddit posts are loaded after searching through search bar
        for (let i=0;i<interception.response?.body.data.dist;i++){
            cy.get(`:nth-child(${i+1}) > .title`).invoke('text').then((titleString)=>{

                expect(titleString).eq(interception.response?.body.data.children[i].data.title);                                                            //Comparing subreddit posts rendered in UI after routing through search bar vs returned body response to verify routing is successful and it dipslays correct data
                expect(subr).eq(interception.response?.body.data.children[i].data.subreddit, 'This post is loaded from Crypto Subreddit - PASSED');         //Checking if subreddit posts rendered are belonged to the subreddit that is been searched in search bar

            });
        };
    });
})

it ('Test 3', ()=>{
    
    let subr = '45';

    cy.intercept('https://www.reddit.com/r/45/new.json').as('testFailedRequest');
    cy.get('.subreddit-input').type(subr);
    cy.get('button').click();

    cy.wait('@testFailedRequest',).then((interception) =>{                                  

        const response = interception.response?.statusCode;
        expect(response).to.eq(404);                                                         //Verify network failed request
   
    });

    cy.contains('Could not retrieve').invoke('text').then((errorMessageText)=>{
            
        expect(errorMessageText).to.eq('Could not retrieve results for ' + subr);           //Verify error message 

    });
    
})

it ('Test 4', ()=>{

    let subr = 'crypto';

    cy.intercept(`https://www.reddit.com/r/${subr}/new.json`).as('testNumberofSubredditMatched');
    cy.get('.subreddit-input').type(subr);
    cy.get('button').click();

    cy.wait('@testNumberofSubredditMatched').then((interception) =>{                                            

        cy.get('.title').then($elements => {
            
            let countOfSubredditMatched_UI = $elements.length;                                                  //Get length of matched subreddit rendered in UI
            console.log('Subreddit matched length rendered in UI: ' + countOfSubredditMatched_UI);
            
            const subredditMatchedPostLength_API = interception.response?.body.data.children.length;            //Get length of matched subreddit in network request
            console.log('Subreddit matched length in network request: ' + subredditMatchedPostLength_API);
    
            expect(countOfSubredditMatched_UI).to.eq(subredditMatchedPostLength_API);                           //Compare number of post rendered in UI vs network request
        })

        
  });
    
})

