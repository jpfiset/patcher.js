// Test cases to be run using rhino
// > rhino -f testcases.js

load('./patcher.js');

var enableDebugLog = false;
var testCount = 0;
var testFailed = 0;

function debug() {
	if( enableDebugLog ) {
		if( typeof(console) !== 'undefined' 
		 && null !== console 
		 && typeof(console.log) === 'function'
		) {
			try { console.log.apply(console,arguments); }
				catch(e) {};
		} else if( typeof(print) === 'function' ){
			print.apply(null, arguments);
		};
	};
};

function printLog(str){
	print(str);
};

/*
 * Test object equality using facilities in
 * patcher
 * @param o1 {Object} One of the objects to compare
 * @param o2 {Object} The other object to compare
 * @return {Boolean} True if the objects are equivalent. Otherwise, false.
 */
function areObjEqual(o1,o2){
	if( o1 === o2 ) {
		return true;
	} else if( typeof(o1) === 'undefined' && typeof(o2) === 'undefined' ){
		return true;
	} else if( typeof(o1) === 'undefined' ){
		return false;
	} else if( typeof(o2) === 'undefined' ){
		return false;
	} else if( null === o1 ){
		return false;
	} else if( null === o2 ){
		return false;
	} else {
		var patch = patcher.computePatch(o1, o2);
		return (patch === null);
	};
};

/*
 * Performs a specific test
 * @param testName {String} Name of test
 * @param prev {Object} Original object
 * @param next {Object} Updated object
 * @param expected {Object} Expected patch to be generated between prev and next
 */
function patchTest(testName, prev, next, expected){
	var patch = patcher.computePatch(prev, next);
	debug(testName, patch);
	var error = null;
	if( ! areObjEqual(patch,expected) ) {
		error = 'unexpected patch';
		debug(testName+' patches(expected, actual)',expected,patch);
	};
	if( null != patch ) {
		patcher.applyPatch(prev,patch);
		if( ! areObjEqual(prev,next) ) {
			error = 'patched object is not equivalent to expected result';
			debug(testName+' patched object (expected,actual)',next,prev);
		};
	};
	++testCount;
	if( error ) {
		++testFailed;
		printLog(testName+' failed: '+error);
	} else {
		printLog(testName+' passed');
	};
};

function main(){
	testCount = 0;
	testFailed = 0;

	patchTest('identity.0',{},{},null);

	patchTest('identity.1',{a:'1',b:'2'},{a:'1',b:'2'},null);
	
	patchTest('add.0',{},{a:1},{a:1});

	patchTest('add.1',{a:'1'},{a:'1',b:{c:{d:'3'},e:4}},{b:{c:{d:'3'},e:4}});
	
	patchTest('remove.0',{a:1,b:2,c:3},{b:2,c:3},{_r:'a'});
	
	patchTest('remove.1',{a:1,b:2,c:3},{c:3},{_r:['a','b']});
	
	patchTest('remove.2',{a:1,b:2,c:3},{},{_r:['a','b','c']});

	patchTest('object.0',{a:{b:'1',c:'3'}},{a:{b:'2',c:'3'}},{a:{b:'2'}});

	patchTest('object.1',{a:{b:'1',c:'3'}},{a:{c:'3'}},{a:{_r:'b'}});

	patchTest('object.2',{a:{b:'1',c:'3'}},{a:{}},{a:{_r:['b','c']}});

	patchTest('object.3',{a:{b:'1',c:'3'}},{a:{d:'4'}},{a:{_r:['b','c'],d:'4'}});

	patchTest('replace.0',{a:1},{a:'1'},{a:'1'});

	patchTest('replace.1',{a:1},{a:{b:'1'}},{a:{b:'1'}});

	patchTest('replace.2',{a:1},{a:[]},{a:[]});

	patchTest('replace.3',{a:[]},{a:1},{a:1});

	patchTest('replace.4',{a:1},{a:['a','b']},{a:['a','b']});
	
	patchTest('array.0',{a:[0,1]},{a:[0,1,2]},{a:{_2:2,_r:3}});
	
	patchTest('array.1',{a:[0,1,2]},{a:[0,1]},{a:{_r:2}});
	
	patchTest('array.2',{a:[0,1,2]},{a:[0,2]},{a:{_r:2,_1:2}});

	patchTest('array.3',{a:[0,'1',{b:2,c:3}]},{a:[0,'1',{b:2,c:3}]},null);

	patchTest('array.4',{a:[0,'1',{b:2,c:3}]},{a:['a','1',{b:2,c:3}]},{a:{_0:'a'}});

	patchTest('array.5',{a:[0,'1',{b:2,c:3}]},{a:[0,{d:4},{b:2,c:3}]},{a:{_1:{d:4}}});

	patchTest('array.6',{a:[0,'1',{b:2,c:3}]},{a:[0,'1','4']},{a:{_2:'4'}});

	patchTest('array.7',{a:[0,'1',{b:2,c:3}]},{a:[0,'1',{b:4,c:3}]},{a:{_2:{b:4}}});

	patchTest('array.8',{a:[0,'1',{b:2,c:3}]},{a:[{b:2,c:3}, 0,'1']},{a:{_0:{b:2,c:3}, _1:0, _2:'1'}});

	patchTest('escape.0',{_a:1},{_a:2},{__a:2});

	patchTest('escape.1',{__a:1},{__a:2},{___a:2});

	patchTest('escape.2',{_a:1},{},{_r:'_a'});

	patchTest('escape.3',{_a:1,_b:2},{},{_r:['_a','_b']});
	
	printLog('Completed: '+testCount+' Failures: '+testFailed)
};

main();