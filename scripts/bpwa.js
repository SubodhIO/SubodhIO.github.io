var app = angular.module('bpwa',[]);

/************************ PARAMS ************************/
app.service('appParams',function(){
	/*
		will be used to share param values across ops
	*/
	this.params = {};
	this.params.dbName = 'komoriOFFLINE';
	this.params.dbVersion = 1;
	this.params.dbTables = [
					{
						name : "KOMSRHeader",
						primarykey : "indexId",
					},
					{
						name : "KOMSRLines",
						primarykey : "indexId",
					},
					{
						name : "KOMSRNotes",
						primarykey : "indexId",
					},
					{
						name : "KOMSRTravelLog",
						primarykey : "indexId",
					},
					{
						name : "KOMLocationAudit",
						primarykey : "indexId",
					}
				];	
	this.params.onlineDbStore = {
		api:'https://om.cloudio.io:9180/api',
		username : 'admin',
		password : 'sreenivt',
		sessionId : null
	};

	this.params.primarykey = {
		'KOMSRHeader' : 'srId',
		'KOMSRLines' : 'lineId',
		'KOMSRNotes' : 'noteId',
		'KOMSRTravelLog' : 'logId',
		'KOMLocationAudit' : 'auditId'
	};

	this.params.offlineMode  = false;

	this.params.offline = {};
	this.params.offline.srHeaderList = [];
	this.params.offline.srLineList = [];
	this.params.offline.srNoteList = [];
	this.params.offline.srTravelLogList = [];

});

/************************ CONNECTIVITY CHECK ************************/
app.service('online',function($rootScope,$http,$q,appParams){
	this.getStatus = function(){
		return $q(function(resolve,reject){
			var url = '/views/ping.html';

			if(appParams.params.offlineMode){
				resolve('offline');
			}
			else {
				$http.get(url).then(function(response){
					resolve('online');
				}, function(error){
					resolve('offline');
				});				
			}


		});
	}
});

/************************ OFFLINE ************************/
app.service('offlineDbStore',function($q,online,appParams){

	var store = this;
	var dbName,dbVersion,dbObjects;

	store.db = null;
	/*
		initiate Local DB
		check for version & upgrade
		proceed on CRUD ops
	*/
	
	/*OFF*/
	store.open = function() {
		return $q(function(resolve, reject) {

			if(store.db != null){
				resolve("sucess");
				return;
			}

			dbName = appParams.params.dbName;
			dbVersion = appParams.params.dbVersion;
			dbObjects = appParams.params.dbTables;

			window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
			window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange

			if (!window.indexedDB) {
				console.log('OFFLINEDBSTORE | Your browser does not support a stable version of IndexedDB.');
			    window.alert("OFFLINEDBSTORE | Your browser doesn't support a stable version of IndexedDB.");
			    reject("Your browser doesn't support a stable version of IndexedDB.");
			    return;
			}
			
			request = window.indexedDB.open(dbName, dbVersion);

			request.onerror = function(event) {
				reject("OFFLINEDBSTORE | Error while opening db!");
			};

			request.onsuccess = function(event) {
				store.db = request.result;
				resolve("success");
			};

			request.onupgradeneeded = function(event) {
				var db = event.target.result;
				var object;
				for(var i =0; i < dbObjects.length; i++){
					object = dbObjects[i];
					console.log('OFFLINEDBSTORE | creating the Object Store '+object.name);
					db.createObjectStore(object.name, {
						keyPath : object.primarykey,
						autoIncrement : true
					});
					/* 
						CODE FOR QUERY

						// In your query section
						var transaction = db.transaction('mystore','readonly');
						var store = transaction.objectStore('mystore');
						var index = store.index('myindex');
						// Select only those records where prop1=value1 and prop2=value2
						var request = index.openCursor(IDBKeyRange.only([value1, value2]));
						// Select the first matching record
						var request = index.get(IDBKeyRange.only([value1, value2]));

					*/
				}


				resolve("success");
			}
		});
	}

	/*OFF*/
	store.clearTable = function(tableName){
		return $q(function(resolve,reject){
			store.open().then(function(res){
				
				var transaction = store.db.transaction([tableName],'readwrite');

				var objectStore = transaction.objectStore(tableName);
				var result = objectStore.clear();

				result.onsuccess = function(event){
					resolve('success');
				}

				result.onerror = function(err){
					reject(err);
				}


			},function(err){
				reject(err);
			})
		});
	};

	
	/*OFF*/
	store.query = function(tableName,params){
		/* 
			if PARAMS is NULL
				QUERY all
			else
				QUERY with params
		*/

        var storeData=[];

		return $q(function(resolve,reject){
			if(tableName){
				/*
					FETCH ALL DATA
				*/
				store.open().then(function(res){
					// Get the access to table
					var transaction = store.db.transaction([tableName]);
					var objectStore = transaction.objectStore(tableName);

					//var storeIndex = objectStore.index('indexSrId');

					/*	var transaction = db.transaction('mystore','readonly');
						var store = transaction.objectStore('mystore');
						var index = store.index('myindex');
						// Select only those records where prop1=value1 and prop2=value2
						var request = index.openCursor(IDBKeyRange.only([value1, value2]));
						// Select the first matching record
						var request = index.get(IDBKeyRange.only([value1, value2])); */



					// Query the table

					/*transaction.oncomplete = function(event){
						console.log('OFFLINEDBSTORE | Query success | '+JSON.stringify(objectStore));	
						resolve(storeData);
					};

					transaction.onerror = function(event){
						reject('OFFLINEDBSTORE | Query Error ');
					};*/
					var req = objectStore.openCursor();
					//var req = objectStore.openCursor();

					req.onsuccess = function(event){
						var cursor = event.target.result;
						if(cursor){
							console.log('OFFLINEDBSTORE | Query '+tableName);
							cursor.value.stored = true;
							// Filter code
							if(params && Object.keys(params).length>0){
								Object.keys(params).forEach(function(k){
									console.log('***'+cursor.value[k]);
									if(cursor.value[k]==params[k]){
										storeData.push(cursor.value);		
									}
								});
							}
							else{
								storeData.push(cursor.value);	
							}
							
							cursor.continue();
						}
						else {
							console.log('OFFLINEDBSTORE | Query '+tableName+' | All entries done.');
							console.log(JSON.stringify(storeData));
							resolve(storeData);
						}
					};

					req.onerror = function(err){
						console.log('OFFLINEDBSTORE | Query '+tableName+' | ERROR.');
						reject(err);
					};


					if(params){
						/* FILTER CODE*/
						/* CHECK IF INDECES ARE PLAUSIBLE */
					}
					/* return the table data*/
					
				}, 
				function(err){
					reject('ERROR | could not open the store '+tableName);
				});
			}
			else {
				console.log('OFFLINEDBSTORE | Cannot query the empty tablename');
				reject('ERROR | No Tablename specified');
			}

		});

		

	};

	/*OFF*/
	store.saveRow = function(tableName,row){

		return $q(function(resolve,reject){

			if(row!==null){

				store.open().then(function(res){

					var mapData = {};
					store.query(tableName,{}).then(function(res){

						angular.forEach(res,function(val){
							mapData[val.srId] = val;
						});


						if(mapData[row.srId]){
							row.remoteAction = 'U';
							row.indexId = mapData[row.srId].indexId;
						}
						else {
							row.remoteAction = 'I';
						}

						if(row!=null){
							console.log('OFFLINEDBSTORE | Save Row | Inserting the row | ');

							var transaction = store.db.transaction([tableName],'readwrite');

							transaction.oncomplete = function(event){
								resolve('TRANSACTION ADD success');
							};

							transaction.onerror = function(event){
								reject('TRANSACTION ADD error');
							}

							var objectStore = transaction.objectStore(tableName);

							/*row._rs = 'I';

							if(row.stored){
								row._rs = 'U';
							}*/
							/* TBD */
							row._rs = row.remoteAction;

							if(row._rs === 'I'){
								var req = objectStore.add(row);
								req.onsuccess = function(event){
									console.log('OFFLINEDBSTORE | Save Row | Insert | Success | '+tableName);
									resolve('success');

								};
								req.onerror = function(event){
									console.log('OFFLINEDBSTORE | Save Row | Insert | Error | '+tableName);
									reject('error');
								};
							}
							else if(row._rs === 'U'){
								//TODO | check primary key
								var req = objectStore.put(row)
								req.onsuccess = function(event){
									console.log('OFFLINEDBSTORE | Save Row | Update | Success | '+tableName);
									resolve('success');

								};
								req.onerror = function(event){
									console.log('OFFLINEDBSTORE | Save Row | Update | Error | '+tableName);
									reject('error');
								};
							}
							else if(row._rs === 'D'){
								/*objectStore.delete(row).onsuccess(function(event){

								}).onerror(function(event){

								});*/
							}
							else {
								console.log('OFFLINEDBSTORE | ERROR | No ROW STATUS UPDATED ');
								reject('ERROR | No ROW STATUS UPDATED');
							}


						}
						else{
							console.log('OFFLINEDBSTORE | Save Row  cannot insert null row');
							reject('ERROR | Save Row  cannot insert null row');
						}						


					},function(err){
						reject(err);
					});






				},function(err){
					console.log('OFFLINEDBSTORE | SaveRow | ERROR | '+err);
					reject('error');
				});			

			}
			else {
				reject('NULL ROW');
			}
				
		});

	};
	/*OFF*/
	store.saveAll = function(tableName,rows){

		return $q(function(resolve,reject){

			var promiseArray = [];
			if(rows.length>0){

					angular.forEach(rows,function(val){
						/*val._rs = 'I';

						if(val.stored){
							val._rs = 'U';
						}
						
						val.deleteFlag='N';*/
						val.lastModifiedDate = new Date();
						promiseArray.push(store.saveRow(tableName,val));
					});

					Promise.all(promiseArray).then(function(res){
						resolve('success');
					}).catch(function(err){
						reject(err);
					});	

			}

			else {
				resolve('success');
			}

		});



	};

	store.clearTable = function(tableName){
		return $q(function(resolve,reject){
			resolve('success');
		});
	};

});

/************************ ONLINE ************************/
app.service('onlineDbStore',function($q,online,appParams,$http,offlineDbStore){
	var store = this;

	store.open = function(){
		/* SIGN IN TO API */
		return $q(function(resolve,reject){

			/* TO DO | have the code for session validation & reinitiate a new one if fails */
			if(appParams.params.onlineDbStore.sessionId!==null){
				resolve('sucess');
				return;
			}
			else {
					$http.post(appParams.params.onlineDbStore.api+'/signin',{username: appParams.params.onlineDbStore.username,
					password: appParams.params.onlineDbStore.password}).then(function(res){
						if(res.data.status === 'ERROR'){
							appParams.params.onlineDbStore.sessionId = null;
							console.log('ONLINEDBSTORE | Could not sign in to the API');
							reject('ERROR');
						}
						else {
							appParams.params.onlineDbStore.sessionId = res.data.sessionId;
							resolve(res.data.sessionId);
							console.log('ONLINEDBSTORE | Sign in to API Successful | Session Id : '+res.data.sessionId);
							
						}
					});		
			}
	
		});
	};

	store.sync = function(tableName,rows){
		return $q(function(resolve,reject){

			var mapData = {};
			var syncData = [];

			/*
				IF PK Exists handle as update
				ELSE handle as insert
			*/

			store.open().then(function(res){



				offlineDbStore.query(tableName,{}).then(function(res){

						var inClause = '';

						/* OFFLINE DATA FIRST */
						angular.forEach(res,function(val){
							if(val.srId){
								if(inClause!==''){
									inClause+=',';
								}
								inClause+=val.srId;

								mapData[val.srId] = val;
							}

							else {
								val.remoteAction = 'I';
								syncData.push(val);
							}

							},function(err){
						reject(err);
					});

						/* OTHER DATA */
						angular.forEach(rows,function(val){
							
								if(val.srId){
									if(inClause!==''){
										inClause+=',';
									}
									inClause+=val.srId;
									if(!mapData[val.srId]){
										mapData[val.srId] = val;	
									}
									
								}

								else {
									val.remoteAction = 'I';
									syncData.push(val);
								}
								
							});

						/* TO DO | Check if whereCluase gets populated in the first run, possible exception */
						var queryParams = {
							params: {
								executeCountSql: 'N'
							},
							whereClause: " #srId# in ("+inClause+") "
						};

						queryParams.sessionId = appParams.params.onlineDbStore.sessionId;

						$http.post(appParams.params.onlineDbStore.api+'/'+tableName,queryParams).then(function(res){

								if(res.data.status === 'ERROR'){
									console.log('ONLINEDBSTORE | SYNC | Error | '+tableName);
									reject(res.data);
								}
								else {
									console.log('ONLINEDBSTORE | SYNC | Success | '+tableName);

									angular.forEach(res.data.data,function(val){
										
										if(mapData[val.srId]){
											var dbUpdateDate = new Date(val.lastUpdateDate);
											var updateDate = new Date(mapData[val.srId].lastUpdateDate);

											if(updateDate>dbUpdateDate){
												mapData[val.srId].remoteAction = 'U';
												syncData.push(mapData[val.srId]);
												console.log('ONLINE SYNC | data to DbData');	
											}
											else {
												console.log('ONLINE SYNC | data to DbData');
												mapData[val.srId] = val;
											}
											
										}
											
									});

									if(syncData.length>0){
										/* save the data */
										store.saveAll(tableName,syncData).then(function(res){
											resolve(mapData);
										},function(err){
											reject(err);
										});
										
									}
									else {
										resolve(mapData);									
									}
									
								}

							
						},function(err){
							reject(err);
						});


					

						


						

				},function(err){
					reject(err);
				});





				if(rows.length>0){

					

					


						


				}
				else {
					resolve('success');
				}	

			},function(err){
				reject(err);
			});

				
		});
	};

	store.query = function(tableName,params){
		return $q(function(resolve,reject){

			store.open().then(function(res){

				/*var queryParams = 

				if(tableName!='KOMSRHeader'){

					queryParams.whereClause = "#srId# = ?";
          			queryParams.whereClauseParams = [appParams.params.viewSr.srId];
				}*/

				//params.sessionId = appParams.params.onlineDbStore.sessionId;

				var queryParams = {
					params: {
						executeCountSql: 'N'
					}
				};

				/*queryParams.whereClause = "#srId# = ?";
	          	queryParams.whereClauseParams = [srId];*/

	          	if(params && Object.keys(params).length>0 ){

		          	queryParams.whereClause = "";
					queryParams.whereClauseParams = [];


					Object.keys(params).forEach(function(k){
						console.log('K | '+k+' / V | '+params[k]);
						if(queryParams.whereClause !== ""){
							queryParams.whereClause += " and ";
						}
						queryParams.whereClause += " #"+k+"# = ? ";

						queryParams.whereClauseParams.push(params[k]);

					});

	          	}


				queryParams.sessionId = appParams.params.onlineDbStore.sessionId;

				$http.post(appParams.params.onlineDbStore.api+'/'+tableName,queryParams).then(
						function(res){

							if(res.data.status === 'ERROR'){
								console.log('ONLINEDBSTORE | QUERY | Error | '+tableName);
								reject(res.data);
							}
							else {
								console.log('ONLINEDBSTORE | QUERY | Success | '+tableName);
								//console.log(JSON.stringify(res.data.data));
								resolve(res.data.data);								
							}

						},
						function(err){
							console.log('ONLINEDBSTORE | QUERY | ERROR | '+tableName);
							reject('error');							
						}
					);



			},function(err){
				
				console.log('ONLINEDBSTORE | QUERY | Error | '+tableName);
				reject('error');

			});

		});	
	};

	store.saveRow = function(tableName,row){

		return $q(function(resolve,reject){

			store.open().then(function(res){

				if(row!=null){

					row.sessionId = appParams.params.onlineDbStore.sessionId;

					var operation_code;

					/*row._rs = 'I';

					if(row[appParams.params.primarykey[tableName]]){
						row._rs === 'U';
					}*/

					row._rs = row.remoteAction;

					if(row._rs === 'I'){
						operation_code = '/insert';
					}
					else if(row._rs === 'U'){
						operation_code = '/update';
					}
					else if(row._rs === 'D'){
						operation_code = '/delete';
					}



					$http.post(appParams.params.onlineDbStore.api+'/'+tableName+operation_code,row).then(
							function(res){
								if(res.data.status==='ERROR'){
									reject(res.data);
								}
								else {
									console.log('ONLINEDBSTORE | SAVE ROW | Success | '+tableName);				
									console.log(JSON.stringify(res.data));
									resolve(res.data);
								}
							}
						);

					
				}
				else {
					console.log('ONLINEDBSTORE | SAVE ROW | Error | '+tableName);
					reject('Error');
				}


			},function(err){
				console.log('ONLINEDBSTORE | SAVE ROW | Error | '+tableName);
				reject('Error');
			});

		});
	};

	store.saveAll = function(tableName,rows){

		return $q(function(resolve,reject){

			store.open().then(function(res){

					var insertRows = [];
					var updateRows = [];

					//params.primarykey

					angular.forEach(rows,function(val){
						val.sessionId = appParams.params.onlineDbStore.sessionId;

						if(val.remoteAction==='U')
						{	
							updateRows.push(val);
						}
						else if((val.remoteAction==='I')) {
							val._rs = 'I';
							insertRows.push(val);
						}
						else
						{
							console.log(' WARNING | ROW WITH INVALID STATUS | WILL NOT BE SAVED ');
						}
					});

					var prArr = [];

					if(updateRows.length>0)
						prArr.push($http.post(appParams.params.onlineDbStore.api+'/'+tableName+'/update',updateRows));
					if(insertRows.length>0)
						prArr.push($http.post(appParams.params.onlineDbStore.api+'/'+tableName+'/insert',insertRows));

					Promise.all(prArr).then(function(res){
						resolve(res);
					}).catch(function(err){
						reject(err);
					});

				/*	$http.post(appParams.params.onlineDbStore.api+'/'+tableName+'/update',rows).then(
							function(res){
								if(res.data.status==='ERROR'){
									reject(res.data);
								}
								else {
									console.log('ONLINEDBSTORE | SAVE ROW | Success ');				
									console.log(JSON.stringify(res.data));
									resolve(res.data);
								}
							}
						);		*/		


				
			},function(err){
				console.log('ONLINEDBSTORE | SAVE ALL | Error');
				reject(err);
			});

		});


	};
});

/************************ SYNC ************************/
app.service('syncDbStore',function($q,offlineDbStore,onlineDbStore,online,appParams){
	var store = this;

	store.query = function(tableName,params){
		return $q(function(resolve,reject){
			resolve('success');
		});	
	};

	store.saveRow = function(tableName,row){
		return $q(function(resolve,reject){
			resolve('success');
		});		
	};

	store.saveAll = function(tableName,rows){
		return $q(function(resolve,reject){
			resolve('success');
		});	
	}
});

/************************ STORE ************************/
app.service('dbStore',function($q,offlineDbStore,onlineDbStore,syncDbStore,online,appParams){

	var store = this;
	var syncStore = {};
	var mapData = {};
	var mapDbData = {};
	var syncRows = [];

	store.syncOfflineDbStore = function(tableName){
		return $q(function(resolve,reject){

			if(syncStore[tableName] && syncStore[tableName].length>0){

				offlineDbStore.query(tableName,{}).then(function(res){

				/*	angular.forEach(res,function(val){
						mapDbData[val.srId] = val; 
					});*/

					angular.forEach(syncStore[tableName],function(val){
						mapData[val.srId] = val;
					});				

					angular.forEach(res,function(val){
						// if the data contains matching from DB 
						if(mapData[val.srId]){
							mapData[val.srId].indexId = val.indexId;
							syncRows.push(mapData[val.srId]);
						}
					});

					if(syncRows.length>0){
						offlineDbStore.saveAll(tableName,syncRows).then(function(res){
							resolve('success');
						},function(err){
							reject(err);
						});
					}
					else {
						resolve('success');	
					}
					


				},function(err){
					reject(err);
				});


			}	
			else{
				resolve('success');	
			}		
			
		});
	};

	store.syncOnlineDbStore = function(tableName){
		return $q(function(resolve,reject){
			if(syncStore[tableName] && syncStore[tableName].length>0){

				onlineDbStore.sync(tableName,syncStore[tableName]).then(function(res){
					resolve('success');
				},function(err){
					reject(err);
				})

			}	
			else{
				resolve('success');	
			}		
		});
	};

	store.sync = function(tableName){
		return $q(function(resolve,reject){
			//if(syncStore[tableName] && syncStore[tableName].length>0)
			if(true)
			{
				store.syncOfflineDbStore(tableName).then(function(res){
					store.syncOnlineDbStore(tableName).then(function(res){
						resolve(res);
					},function(err){
						reject(err);
					});
				},function(err){
					reject(err);
				});
			}
			else {
				resolve(syncStore[tableName]);
			}
		});
	};

	store.loadStore = function(tableName,params){
		return $q(function(resolve,reject){
			online.getStatus().then(function(res){
				if(res==='online'){

					onlineDbStore.query(tableName,params).then(function(res){
						syncStore[tableName] = res;
 						resolve(syncStore[tableName]);
					},function(err){
						reject(err);
					});

				}
				else if(res==='offline'){
					offlineDbStore.query(tableName,params).then(function(res){
						syncStore[tableName] = res;
						resolve(syncStore[tableName]);
					},function(err){
						reject(err);
					});
					
				}
			},function(err){
				reject(err);
			});
		});	
	}

	store.query = function(tableName,params){
		return $q(function(resolve,reject){

			store.sync(tableName).then(function(res){
				console.log('SYNC success');
				store.loadStore(tableName,params).then(function(res){
					resolve(res);
				},function(err){
					reject(err);
				});
			},function(err){
				console.log('SYNC Error');
				store.loadStore(tableName,params).then(function(res){
					resolve(res);
				},function(err){
					reject(err);
				});
			});	
			
		});
	};

	store.queryOffline = function(tableName,params){
		return $q(function(resolve,reject){
			offlineDbStore.query(tableName,params).then(function(res){
						resolve('success');
					},function(err){
						reject(err);
					});
		});
	};

	store.saveRowOffline = function(tableName,row){
		return $q(function(resolve,reject){

			offlineDbStore.saveRow(tableName,row).then(function(res){
				resolve(res);
			},function(err){
				reject(err);
			});
		});
	};

	store.saveAllOffline = function(tableName,rows){
		return $q(function(resolve,reject){
			resolve('sucess');
		});
	};

	store.deleteRowOffline = function(tableName,row){
		return $q(function(resolve,reject){
			resolve('success');
		});
	};	

	store.clearTableOffline = function(tableName){
		return $q(function(resolve,reject){
			resolve('success');
		});
	};


	store.saveRow = function(tableName,row){

	};

	store.saveAll = function(tableName,rows){

	};


});	


