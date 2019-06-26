# Open Source Hollywood


### App architecture

	Client		browser or mobile
	   |
	   |
	   |
	 NGINX		proxy	network security settings live here
	   |
	   |
	   |
	 Meteor-----Mongo	app connected to database
	   
  ----------------------
  	Operating System	  system security settings live here
  ----------------------

  	 NodeJS / Handler		alternate app responsible for email and AI services
  	   |
  	   |_______ Mongo


I've been running the app on Ubuntu14 with Startup (9 9's uptime)

It can be run on any Linux system, and needs process management of choice (Startup was mine for this project)

`Handler App` will be available on another repository for future edits.

All background work, artificial intelligence, email service, advanced merchant processing should be on the `Handler App`.


### Getting Started

* Download and install Meteor version 1.3.2.4 this app will not work with newer versions

* update database path in the `local.sh` file-- you must use Mongo with GridFS enabled
> we use GridFS for filesystem storage of large files

* turning on the app for development is different than turning it on for production


===> DEVELOPMENT
`meteor --settings settings.json`


===> PRODUCTION
`meteor build . --architecture os.linux.x86_64`
* generates bundle that can be run with NodeJS command


===> CONFIGS
`export METEOR_SETTINGS='{"private":{"AUTH0_CLIENT_ID":"$AUTH0_CLIENT_ID","AUTH0_DOMAIN":"$AUTH0_CLIENT_DOMAIN","testSecretKey":"$STRIPE_TEST_KEY","liveSecretKey":"$STRIPE_LIVE_KEY"},"public":{"stripe":{"testPublishableKey":"$STRIPE_TEST_PUBLIC","livePublishableKey":"$STRIPE_LIVE_PUBLIC"}},"AWSAccessKeyId":"$AMAZONACCESSID","AWSSecretAccessKey":"$AMAZONSECRETKEY","PrerenderIO":{"token":"$PRERENDER.IO_KEY"}}'`


===> START SCRIPT
`exec node /path/to/OSH/bundle/main.js --settings ../settings.json >> /path/to/OSH/produsus.log`


### Directory Layout

> views
	* all the frontend templates, events, and routings

> collections
	* all of the model declarations and schemas (schemas are optional and not used on some models)

> lib
	* `main.js` is the workhorse of the app-- it's where almost all the backend functionality exists (in one file)

> public
	* where the CSS, images, and frontend assets exist

> server
	* pure backend functionality: registering models / permissions, startup script, and cron functions happen here



### Features

* AUTHOR UPDATES 
> author adds public updates relating to a campaign

* FILTER 
> users can filter campaigns based on type and location

* DELETE NOTIFICATION 
> remove phone and/or email notification settings

* VERIFY PHONE SOURCE 
> 2-way authentication for phone notifications 

* VERIFY EMAIL SOURCE 
> 2-way authentication for email notifications 

* RE-VERIFY NOTIFICATION SOURCE 
> re-send verification for phone and/or email notification settings

* REAL-TIME NOTIFICATIONS 
> set phone and/or email notification settings
### notifies user when important events occur in real-time

* EDIT PROFILE 
> update personal information

* DEFAULT VIRTUAL ACCOUNT 
> users get assigned a virtual bank account by default

* ADD BANK INFO 
> user connects their real bank accounts to their virtual accounts

* REMOVE BANK INFO 
> remove link to real bank account

* CREATE CAMPAIGN
> author creates new campaign

* EDIT CAMPAIGN
> update campaign merchandise, roles, and settings

* VOTE UP 
> vote a campaign up, defines user behaviorally

* REMOVE VOTE UP
> remove a previous vote up to a campaign

* DONATION 
> campaign receives donations from the public

* LEND OFFER ASSET 
> offer from one user to a campaign to lend resources

* APPLY CREW & CAST 
> offer from one user to apply for a role on campaign

* BUY GIFT 
> merch sales

* ACCEPT USER TO PROJECT 
> author accepts user to a campaign

* REJECT USER FROM PROJECT 
> author declines user's offer to a campaign

* FINISH PROJECT 
> author marks campaign as ready for distribution

* ADD COMMENT 
> add comments to a campaign's page

* NEGOTIATION MESSAGE 
> adds a message from one user to another during negotiations of their role in a campaign

* TRANSFER FUNDS 
> on-demand transfer of any available funds to a user's real bank account

* FLAG MATERIAL 
> user determines the material should be removed or reviewed

* REVENUE SHARING - INITIAL PURCHASE 
> public sales of a portion of future earnings for a campaign

* ENTER NEGOTIATIONS WITH APPLICANT 
> author invites applicant to negotiate for role

* TOGGLE OFFER DURING NEGOTIATION 
> author can approve or deny individual role offers during negotiations

* ADD AUDITION URL 
> applicant shares audition materials with author

* UPDATE OFFER AGREEMENT 
> author changes terms of negotiated agreement

* LOCK AGREEMENT AND OFFER TO APPLICANT 
> author sends an agreement to applicant for review

* APPLICANT FORMAL OFFER 
> applicant agrees to offer, and makes formal offer with same terms to author

* APPLICANT COUNTER OFFER 
> applicant rejects offer, author is able to update terms

* AUTHOR ACCEPTS AGREEMENT 
> author makes final acceptance during negotiations
