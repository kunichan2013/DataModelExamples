
WAF.onAfterInit = function onAfterInit() {// @lock

// @region namespaceDeclaration// @startlock
	var coWorkerEvent = {};	// @dataSource
	var login1 = {};	// @login
	var documentEvent = {};	// @document
// @endregion// @endlock

// eventHandlers// @lock

	coWorkerEvent.onCurrentElementChange = function coWorkerEvent_onCurrentElementChange (event)// @startlock
	{// @endlock
		//var coWorkerID = source.coWorker.ID;
		
		//var theEval = source.evaluation.find();
		
		
	};// @lock

	login1.logout = function login1_logout (event)// @startlock
	{// @endlock
		checkLogin();
	};// @lock

	login1.login = function login1_login (event)// @startlock
	{// @endlock
		checkLogin();
	};// @lock
	function checkLogin()
	{
		var currUser = WAF.directory.currentUser();
		if (currUser != null)
		{
			try {
				source.coWorker.allEntities();
				$$('container1').show();
			} catch (e) {
				source.coWorker.noEntities();
			}
			
		}
		else
		{
			source.coWorker.noEntities();
			$$('container1').hide();
			$$('login1').showLoginDialog();

		}
	};
	

	documentEvent.onLoad = function documentEvent_onLoad (event)// @startlock
	{// @endlock
		checkLogin();
	};// @lock

// @region eventManager// @startlock
	WAF.addListener("coWorker", "onCurrentElementChange", coWorkerEvent.onCurrentElementChange, "WAF");
	WAF.addListener("login1", "logout", login1.logout, "WAF");
	WAF.addListener("login1", "login", login1.login, "WAF");
	WAF.addListener("document", "onLoad", documentEvent.onLoad, "WAF");
// @endregion
};// @endlock
