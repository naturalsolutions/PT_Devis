///Récupère l'ensemble des projets de NS via le token de FB.
///Param : none
///Return : [objects] repésentant les projets de NS
function getAllProjects() {
	var myProjects;
	$.ajax({
		url: "https://www.pivotaltracker.com/services/v5/projects",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-TrackerToken', 'b4a752782f711a7c564221c2b0c2d5dc');
		},
		async: false,
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		processData: false,
		success: function (data) {
			myProjects = data;
		},
		error: function () {
			alert("Cannot get data");
		}
	});
	return myProjects;
}

///Récupère l'ensemble des epics d'un projet.
///Param : projectId -> id du projet dans PT
///Return : [objects] repésentant les epics du projets
function getEpics(projectId) {
	var epics;
	$.ajax({
		url: "https://www.pivotaltracker.com/services/v5/projects/" + projectId + "/epics",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-TrackerToken', 'b4a752782f711a7c564221c2b0c2d5dc');
		},
		async: false,
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		processData: false,
		success: function (data) {
			epics = data;
		},
		error: function () {
			alert("Cannot get data");
		}
	});
	return epics;
}

///Récupère l'ensemble des membres d'un projet.
///Param : projectId -> id du projet dans PT
///Return : [objects] repésentant les personnes impliquées dans le projet
function getEpicStories(projectId, epicLabel) {
	var stories;
	$.ajax({
		url: "https://www.pivotaltracker.com/services/v5/projects/" + projectId + "/stories?with_label=" + epicLabel.toLowerCase()	,
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-TrackerToken', 'b4a752782f711a7c564221c2b0c2d5dc');
		},
		async: false,
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		processData: false,
		success: function (data) {
			stories = data;
		},
		error: function () {
			alert("Cannot get data");
		}
	});
	return stories;
}

function getTasksInfos(projectId,storyId){
	var mytasks = [];
	$.ajax({
		url: "https://www.pivotaltracker.com/services/v5/projects/" + projectId + "/stories/" + storyId + "/tasks",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-TrackerToken', 'b4a752782f711a7c564221c2b0c2d5dc');
		},
		async: false,
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		processData: false,
		success: function (data) {
			myTempTasks = data;
		},
		error: function () {
			alert("Cannot get data");
		}
	});
	var ressource = {};
	//On assigne les différentes informations aux taches (durée, éxecutant, imgCllass)
	$.each(myTempTasks, function () {
		if (!this.complete) {
			var regexPP = /\d(\+\d)+$/;
			var regexPP2 = /[A-Z]+(\+[A-Z]+)+$/;
			//Taches PairPro sans noms
			var tabDescrInfo = this.description.split('.-');
			if (tabDescrInfo.length <= 1) {
				tabDescrInfo = this.description.split('. -');
			}
			if (tabDescrInfo.length > 1) {
				if (this.description.trim().match(regexPP) || this.description.trim().match(regexPP2)) {
					regexPP2 = /[A-Z]+(\+[A-Z]+)/;
					if (this.description.trim().match(regexPP2)) {
						var ownerBrut = regexPP2.exec(this.description.trim());
						var owners = ownerBrut[0].split("+");
						this.description = this.description.trim().replace(regexPP2, "");
						regexPP = /\d+(\+\d+)+/;
						if (this.description.trim().match(regexPP)) {
							var tabDureeBrut = regexPP.exec(this.description.trim());
							this.description = this.description.trim().replace(regexPP, "");
							var tabDuree = tabDureeBrut[0].split('+');

							if(tabDuree.length != owners.length){
								alert('La tâche PairProg de la storie n° : ' + storyId + ' contient une malformation1');
							}else{
								for(var i in owners){
									if(!ressource["" + owners[i]]){
										ressource["" + owners[i]] = parseInt(tabDuree[i]);
									}else{
										ressource["" + owners[i]] += parseInt(tabDuree[i]);
									}
								}
							}
							this.description = this.description.trim().replace(regexPP, "");
						} else {
							this.duree = null;
						}
						this.isPairProg = true;
					}
				} else {
					regexPP = /(\d)+$/;
					//Tahe (simple) avec horaires sans Initial
					if (this.description.trim().match(regexPP)) {
						var duree = regexPP.exec(this.description.trim())[0];
						this.description = this.description.trim().replace(regexPP, "");
						regexPP = /([A-Z]+)/;
						if (this.description.trim().match(regexPP)) {
							var taskMemeber = regexPP.exec(this.description.trim())[0];
							var owner_initial = taskMemeber;
							if(!ressource["" + taskMemeber]){
								ressource["" + taskMemeber] = parseInt(duree);
							}else{
								ressource["" + taskMemeber] += parseInt(duree);
							}
							this.description = this.description.trim().replace(regexPP, "");
						} else if (memberInitial || taskMemeber) {
							var owner_initial = (memberInitial ? memberInitial : taskMemeber);
							if(!ressource["" + owner_initial]){
								ressource["" + owner_initial] = parseInt(duree);
							}else{
								ressource["" + owner_initial] += parseInt(duree);
							}
						} else {
							alert('La tâche de la storie n° : ' + storyId + ' contient une malformation2');
						}
						//TacheSimple avec temps et intital
					} else if (this.description.trim().match(/([A-Z]+)+$/)) {
						regexPP = /([A-Z]+)+$/;
						var owner_initial;
						if (this.description.trim().match(regexPP)) {
							var taskMemeber = regexPP.exec(this.description.trim())[0];
							owner_initial = taskMemeber;
							description = this.description.trim().replace(regexPP, "");
						} else if (memberInitial || taskMemeber) {
							owner_initial = (memberInitial ? memberInitial : taskMemeber);
						} else {
							alert('La tâche de la storie n° : ' + storyId + ' contient une malformation3');
						}
						this.description = this.description.trim().replace(regexPP, "");
						
						regexPP = /(\d)+$/;
						console.log('pdfvcnikjzsdbhngvpî', this.description.trim())
						if (regexPP.exec(this.description.trim())) {
							var duree = regexPP.exec(this.description.trim())[0];
							console.log('éopazjefojazf', regexPP.exec(this.description.trim())[0], this.diree)
							this.description = this.description.trim().replace(regexPP, "");
							if(!ressource["" + owner_initial]){
								ressource["" + owner_initial] = parseInt(duree);
							}else{
								ressource["" + owner_initial] += parseInt(duree);
							}
						} else {
							alert('La tâche de la storie n° : ' + storyId + ' contient une malformation4');
						}
						
					} else {
						alert('La tâche de la storie n° : ' + storyId + ' contient une malformation5');
						
					}
					// }
				}				
			} else {
				this.description = this.description.trim();
				this.isPairProg = false;
				this.owner_initial = (memberInitial ? memberInitial : null);
				this.duree = null;
			}
		}
	});
	return ressource;
}

function calculateTasks(stories, projectId){
	//amo part
	var result = {
		amo:{},
		des:{},
		dev:{}
	};

	for(var i in stories.des){
		result.amo = getTasksInfos(projectId, stories.amo[i].id) 
	}
	for(var j in stories.des){
		result.des = getTasksInfos(projectId, stories.des[i].id) 
	}
	for(var k in stories.dev){
		result.dev = getTasksInfos(projectId, stories.dev[i].id) 
	}

	console.log('result', result);
}