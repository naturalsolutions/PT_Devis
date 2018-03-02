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
			data.sort(function (a, b) {
				if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
				if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
				return 0;
			});
			var toAdd = [];
			for (var i in data) {
				if (data[i].description == 'reneco') {
					toAdd.push(data[i]);
				}
			}
			myProjects = toAdd;
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
		url: "https://www.pivotaltracker.com/services/v5/projects/" + projectId + "/stories?with_label=" + epicLabel.toLowerCase(),
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

function sortFinishedStories(stories) {
	var finishedTab = [];
	var unfinishedTab = [];
	for (var i in stories) {
		if (stories[i].current_state == "accepted") {
			finishedTab.push(stories[i]);
		} else {
			unfinishedTab.push(stories[i]);
		}
	}
	return { finished: finishedTab, unfinished: unfinishedTab };
}

function setError(url, tasksId) {
	$('#errorLink').append('<a href="' + url + '">' + tasksId + '</a>')
}

function fillUserTab(tab, initiales, value, bonusState) {
	if (bonusState == '' || bonusState === undefined || bonusState == null) {
		if (!tab.find(x => x.initials == initiales)) {
			tab.push({ initials: initiales, value: parseInt(value) });
		} else {
			var index = tab.findIndex(x => x.initials == initiales);
			if (tab[index].value) {
				
				tab[index].value += parseInt(value);
			} else {
				
				tab[index].value = parseInt(value);
			}
		}
	} else if (bonusState == 'we') {
		if (!tab.find(x => x.initials == initiales)) {
			tab.push({ initials: initiales, valueWE: parseInt(value) });
		} else {
			var index = tab.findIndex(x => x.initials == initiales);
			if (tab[index].valueWE) {				
				tab[index].valueWE += parseInt(value);
			} else {
				tab[index].valueWE = parseInt(value);
			}
		}
	} else if (bonusState == 'f') {
		if (!tab.find(x => x.initials == initiales)) {
			tab.push({ initials: initiales, valueF: parseInt(value) });
		} else {
			var index = tab.findIndex(x => x.initials == initiales);
			if (tab[index].valueF) {				
				tab[index].valueF += parseInt(value);
			} else {
				tab[index].valueF = parseInt(value);
			}
		}
	}
	return tab;
}

function parseAndFillTasks(tasks, storyId, projectId, isFactu) {
	var ressource = [];
	var _this = this;
	$.each(tasks, function () {
		var tabDescrInfo = this.description.split('.-');
		if (tabDescrInfo.length <= 1) {
			tabDescrInfo = this.description.split('. -');
		}
		var isWE = false;
		var bonusState = null;
		if (isFactu) {
			var regexWE = /(\@[wW])$/;
			if (this.description.trim().match(regexWE)) {				
				isWE = true;
				bonusState = 'we';
				this.description = this.description.trim().replace(regexWE, "");
			} else {
				var regexF = /(\@[fF])$/;
				if (this.description.trim().match(regexF)) {
					bonusState = 'f';
					this.description = this.description.trim().replace(regexF, "");
				}
			}
		}
		//Si la story ne peut pas etre découpée alors elle n'est pas estimée et ou attribuée
		if (tabDescrInfo.length > 1) {
			//cherche "+" dans le text
			var regex = /\+/
			//Si n programming
			if (this.description.trim().match(regex)) {
				//cheche les initals dans le text
				//regex = /[A-Z]+(\+[A-Z]+)+/
				regex = /[A-Z]{2,}(\+[A-Z]{2,})+$/
				if (this.description.trim().match(regex)) {
					var ownerBrut = regex.exec(this.description.trim());
					var owners = ownerBrut[0].split("+");
					this.description = this.description.trim().replace(regex, "");
					//Cherche les durees dans le text
					regex = /\d+(\+\d+)+/;
					if (this.description.trim().match(regex)) {
						var tabDureeBrut = regex.exec(this.description.trim());
						this.description = this.description.trim().replace(regex, "");
						var tabDuree = tabDureeBrut[0].split('+');
						if (tabDuree.length != owners.length) {
							alert('Probleme d\'estimation et initiales dans la tâche : ' + this.id + ' de la storie n° : ' + storyId + ' n\'est pas estimée.\r\n https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + '/tasks/' + this.id)
							_this.setError('https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + '/tasks/' + this.id, this.id)
						} else {
							for (var i in owners) {
								ressource = _this.fillUserTab(ressource, owners[i], tabDuree[i], bonusState);
							}
						}
						//this.description = this.description.trim().replace(regex, "");
					} else {
						this.duree = null;
					}
					//alert('Probleme d\'estimation dans la tâche : ' + this.id + ' de la storie n° : ' + storyId + ' n\'est attribué et/ou n\'est pas estimée.\r\n https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId +'/tasks/' + this.id)
				} else {
					alert('Probleme d\'initales dans la tâche : ' + this.id + ' de la storie n° : ' + storyId + ' n\'est attribué.\r\n https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + '/tasks/' + this.id)
					_this.setError('https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + '/tasks/' + this.id, this.id)
				}
			}
			//Tache solo
			else {
				//CHerche l'owner de la tache
				regex = /[A-Z]{2,}$/;
				var owner_initial;
				if (this.description.trim().match(regex)) {
					var taskMemeber = regex.exec(this.description.trim())[0];
					owner_initial = taskMemeber;
					this.description = this.description.trim().replace(regex, "");
					//La duree
					regex = /(\d)+$/;
					if (regex.exec(this.description.trim())) {
						var duree = regex.exec(this.description.trim())[0];
						this.description = this.description.trim().replace(regex, "");
						ressource = _this.fillUserTab(ressource, owner_initial, duree, bonusState)

					} else {
						alert('Probleme d\'estimation dans la tâche : ' + this.id + ' de la storie n° : ' + storyId + ' n\'est pas estimée.\r\n https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + '/tasks/' + this.id)
						_this.setError('https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + '/tasks/' + this.id, this.id)
					}
				} else {
					alert('Probleme d\'initales dans la tâche : ' + this.id + ' de la storie n° : ' + storyId + ' n\'est attribué.\r\n https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + '/tasks/' + this.id)
					_this.setError('https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + '/tasks/' + this.id, this.id)
				}

			}
		} else {
			alert('La tâche : ' + this.id + ' de la storie n° : ' + storyId + ' n\'est attribué et/ou n\'est pas estimée.\r\n https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + '/tasks/' + this.id);
			_this.setError('https://www.pivotaltracker.com/n/projects/' + projectId + '/stories/' + storyId + '/tasks/' + this.id, this.id)
		}
		// if (!this.complete && !toFactu) {

		// }else if(!this.complete && toFactu){

		// }
	});
	return ressource;
}

function getTasksInfos(projectId, storyId, toFactu = false) {
	var myTempTasks = [];
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
	var ressource = [];
	//On assigne les différentes informations aux taches (durée, éxecutant, imgCllass)
	if (!toFactu) {
		var ressource = this.parseAndFillTasks(myTempTasks, storyId, projectId, false);
	} else {
		var ressource = this.parseAndFillTasks(myTempTasks, storyId, projectId, true);
	}
	
	return ressource;
}

function manageResult(result, newInfos) {
	for (var i in newInfos) {
		if (newInfos[i]) {
			var index = result.findIndex(x => x.initials == newInfos[i].initials);
			if (result.find(x => x.initials == newInfos[i].initials)) {
				if (newInfos[i].value) {
					if (result[index].value) {
						result[index].value += parseInt(newInfos[i].value);
					}else {
						result[index].value = parseInt(newInfos[i].value);
					}
				}
				if (newInfos[i].valueWE) {
					if (result[index].valueWE) {
						result[index].valueWE += parseInt(newInfos[i].valueWE);
					} else {
						result[index].valueWE = parseInt(newInfos[i].valueWE);
					}
				}
				if (newInfos[i].valueF) {
					if (result[index].valueF) {
						result[index].valueF += parseInt(newInfos[i].valueF);
					} else {
						result[index].valueF = parseInt(newInfos[i].valueF);
					}
				}
			} else {
				result.push(newInfos[i]);
			}
		}
	}
	return result;
}

function calculateTasks(stories, projectId, toFactu = false) {
	//amo part
	var result = {
		amo: [],
		des: [],
		dev: []
	};
	if (stories) {
		for (var i in stories.amo) {
			result.amo = manageResult(result.amo, getTasksInfos(projectId, stories.amo[i].id, toFactu));
		}
		for (var j in stories.des) {
			result.des = manageResult(result.des, getTasksInfos(projectId, stories.des[j].id, toFactu))
		}
		for (var k in stories.dev) {
			result.dev = manageResult(result.dev, getTasksInfos(projectId, stories.dev[k].id, toFactu))
		}
	}
	if (!toFactu) {
		Backbone.trigger('returnProcess', result);
	} else {
		//Backbone.trigger('returnFactuProcess', result);
		return result;
	}
}

function getAcceptedStoriesAtDate(projectId, leftDate, rightDate, epic) {
	var stories = {
		amo: [],
		des: [],
		dev: []
	};
	var storiesBonus = {
		amo: [],
		des: [],
		dev: []
	};
	var storiesContainer = $('#stories');
	var amoCont = storiesContainer.find('#amo');
	amoCont.html('');
	var desCont = storiesContainer.find('#des');
	desCont.html('');
	var devCont = storiesContainer.find('#dev');
	devCont.html('');
	//https://www.pivotaltracker.com/services/v5/projects/1621131/stories?with_label=commande 1 - 31 janvier 2018&with_state=accepted	
	//https://www.pivotaltracker.com/services/v5/projects/720865/stories?accepted_after=2017-12-31T00:00:00.000Z&accepted_before=2018-02-01T00:00:00.000Z
	$.ajax({
		url: "https://www.pivotaltracker.com/services/v5/projects/" + projectId + "/stories?with_label=" + epic + "&accepted_after=" + leftDate.add(-1, "days").toISOString() + "&accepted_before=" + rightDate.toISOString(),
		//url: 'https://www.pivotaltracker.com/services/v5/projects/720865/stories?accepted_after=2017-12-31T00:00:00.000Z&accepted_before=' +rightDate.toISOString(),
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-TrackerToken', 'b4a752782f711a7c564221c2b0c2d5dc');
		},
		async: false,
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		processData: false,
		success: function (data) {
			temp_stories = manageResult(data);
			$.each(temp_stories, function () {
				var labels = this.labels.map(o => o.name);
				if (labels.indexOf('bonus') != -1) {
					this.isBonus = true;
				} else {
					this.isBonus = false;
				}
				for (var i in labels) {
					if (labels[i] == 'amo') {
						if (this.isBonus) {
							storiesBonus.amo.push(this);
						} else {
							stories.amo.push(this);
						}
						amoCont.append('<li>' + this.name + '</li>');
					} else if (labels[i] == 'des') {
						if (this.isBonus) {
							storiesBonus.des.push(this);
						} else {
							stories.des.push(this);
						}
						desCont.append('<li>' + this.name + '</li>');
					} else if (labels[i] == 'dev') {
						if (this.isBonus) {
							storiesBonus.dev.push(this);
						} else {
							stories.dev.push(this);
						}
						devCont.append('<li>' + this.name + '</li>');
					}

				}
			})
		},
		error: function () {
			alert("Cannot get data");
		}
	});

	return { stories: stories, bonus: storiesBonus };
}


function getUnfinishedStories(projectId, epic) {
	var unfinishedStories = []
	$.ajax({
		url: 'https://www.pivotaltracker.com/services/v5/projects/' + projectId + '/stories?with_label=' + epic,
		//url: 'https://www.pivotaltracker.com/services/v5/projects/720865/stories?accepted_after=2017-12-31T00:00:00.000Z&accepted_before=' +rightDate.toISOString(),
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-TrackerToken', 'b4a752782f711a7c564221c2b0c2d5dc');
		},
		async: false,
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		processData: false,
		success: function (data) {
			for (var i in data) {
				if (data[i].current_state != 'accepted' && data[i].story_type != 'release') {
					unfinishedStories.push(data[i]);
				}
			}

		}
	});
	return unfinishedStories;
}