var express = require("express"),
	app = express(),
	request = require("./await-request")
	dotenv = require('dotenv').config('/.env');

app.set("view engine", "ejs");
app.use(express.static("public"));

const BASE_API = process.env.BASE_API;
const API_KEY = process.env.API_KEY;

const SKI_API = process.env.SKI_API;
const SKI_API_KEY = process.env.SKI_API_KEY;

var mtnData = [
	{
    snoKey: "802019",
    name: "Stratton",
    location: "Vermont",
    img: "https://pbs.twimg.com/media/EO0EbdLX0AgPVM2.jpg"
  },
	{
    snoKey: "802007",
    name: "Killington",
    location: "Vermont",
    img: "https://img4.onthesnow.com/image/xl/49/freeskiers_coming_gondola_goes_killington_vt_495.jpg"
  },
	{
    snoKey: "603014",
    name: "Loon Mountain",
    location: "New Hampshire",
    img: "https://www.skimag.com/.image/ar_16:9%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cg_faces:center%2Cq_auto:good%2Cw_768/MTU4NjEyMDc0MTM2ODcyMzY5/ski1018-rg-loon2.jpg"
  },
	{
    snoKey: "207009",
    name: "Sunday River",
    location: "Maine",
    img: "https://assets.agentfire2.com/uploads/sites/347/2018/10/5-min-767x431.jpg"
  },
	{
    snoKey: "207008",
    name: "Sugarloaf",
    location: "Maine",
    img: "https://scontent-lga3-1.xx.fbcdn.net/v/t1.0-9/82541258_10156484672096879_1929023215980511232_o.jpg?_nc_cat=103&_nc_ohc=PBjgQ58M9roAX-gnDi3&_nc_ht=scontent-lga3-1.xx&oh=2fd428017bc607798b3038d276fa9869&oe=5ED6BDC5"
  },
	{
    snoKey: "518012",
    name: "Whiteface Mountain",
    location: "New York",
    img:"https://www.skimag.com/.image/ar_16:9%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cg_faces:center%2Cq_auto:good%2Cw_768/MTQ5ODE5MzEyNjY2ODQ2OTQ2/whiteface-web.jpg"
  },
  {
    snoKey: "802023",
    name: "Sugarbush",
    location: "Vermont",
    img:"https://www.skimag.com/.image/ar_16:9%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cg_faces:center%2Cq_auto:good%2Cw_768/MTUwMTIxMTIzNzc2ODMyOTQ4/ski1017_rge_sugarbush2_by_brianmohr-emberphoto_v3.jpg"
  }
];

app.get("/", (req, res) => {
	res.redirect("mountains");
	// res.render("home");
});

const makeReq = async (requestString) => {
    try {
        const result = await request(requestString);
        // console.log(result);
		return result;
    }
    catch (err) {
        console.error(err);
    }
}

async function makeCalls() {
  try {
    await mtnData.forEach( async(mtn) => {
		var requestString = SKI_API + "conditions.php?apiKey="+ SKI_API_KEY + "&ids="+ mtn.snoKey + "&output=json&updatesOnly=true";
		// console.log(requestString);
		let result = await makeReq(requestString);
		var mtnD = await JSON.parse(result);
		// console.log(mtnD.items[0].resortName);
  		// await console.log(mtnD);
		mtn["id"] = await mtnD.items[0].id;
		mtn["name"] = await mtnD.items[0].resortName;
		mtn["state"] = await mtnD.items[0].state;
		
		mtn["low"] = await mtnD.items[0].weatherToday_Temperature_Low;
		mtn["high"] = await mtnD.items[0].weatherToday_Temperature_High;
		mtn["lowTom"] = await mtnD.items[0].weatherTomorrow_Temperature_Low;
		mtn["highTom"] = await mtnD.items[0].weatherTomorrow_Temperature_High;
		mtn["lowNext"] = await mtnD.items[0].weatherDayAfterTomorrow_Temperature_Low;
		mtn["highNext"] = await mtnD.items[0].weatherDayAfterTomorrow_Temperature_High;
		
		mtn["weatherText"] = await mtnD.items[0].weatherToday_Condition;
		mtn["weatherTomText"] = await mtnD.items[0].weatherTomorrow_Condition;
		mtn["weatherNextText"] = await mtnD.items[0].weatherDayAfterTomorrow_Condition;
		
		mtn["seasonTotal"] = await mtnD.items[0].seasonTotal;
		mtn["trailsOpen"] = await mtnD.items[0].openDownHillTrails;
		mtn["trailsMax"] = await mtnD.items[0].maxOpenDownHillTrails;
		mtn["acresOpen"] = await mtnD.items[0].openDownHillAcres;
		mtn["acresMax"] = await mtnD.items[0].maxOpenDownHillAcres;
		mtn["liftsOpen"] = await mtnD.items[0].openDownHillLifts;
		mtn["liftsMax"] = await mtnD.items[0].maxOpenDownHillLifts;
		mtn["terrainParksOpen"] = await mtnD.items[0].numberTerrainParksOpen;
		mtn["pCond"] = await mtnD.items[0].primarySurfaceCondition;
		mtn["sCond"] = await mtnD.items[0].secondarySurfaceCondition;
		
		mtn["snowComment"] = await mtnD.items[0].snowComments;
		mtn["snowPredict"] = await mtnD.items[0].predictedSnowFall_72Hours;
		mtn["lastSnow"] = await mtnD.items[0].lastSnowFallDate;
		mtn["lastAmount"] = await mtnD.items[0].lastSnowFallAmount;
		
		mtn["wkndHrs"] = await mtnD.items[0].weekendHours;
		mtn["wkdyHrs"] = await mtnD.items[0].weekdayHours;
		
		// console.log(mtn);

	});
  } catch(err) {
    console.log(err);
  }
}

app.get("/mountains", async(req, res) => {
	try {
		(async() => {
			console.log('before start');
			const result = await makeCalls();
			await new Promise((resolve, reject) => setTimeout(resolve, 1500));
			res.render("mountains", {data: mtnData, allData: mtnData});
			console.log('after start');
			// console.log(result);
		})();
	} catch(err) {
		console.log(err);
	}
});

app.get("/mountains/:id", (req, res) => {
	try {
		(async() => {
			console.log('before start');
			const result = await makeCalls();
			await new Promise((resolve, reject) => setTimeout(resolve, 1500));
			var mountain = mtnData.find(obj => {
				return obj.id === req.params.id;
			});
			res.render("mountainView", {data: mountain, allData: mtnData});
			console.log('after start');
		})();
	} catch(err) {
		console.log(err);
	}
});

app.get("/mountains/sort/:cond", (req, res) => {
	
	try {
		(async() => {
			// console.log("COND:"+req.params.cond);
			// console.log('before start');
			// const result = await makeCalls();
			// await new Promise((resolve, reject) => setTimeout(resolve, 1500));
			// var mtnDataSorted = mtnData.find(obj => {
			// 	console.log("STATE IN LOOP: "+obj.state.toLowerCase())
			// 	return obj.state.toLowerCase() === req.params.cond.toLowerCase();
			// });
			var mtnDataSorted = mtnData.filter(mt => mt.state.toLowerCase() === req.params.cond.toLowerCase());
			console.log("MOUNTAIN DATA SORTED: "+mtnDataSorted)
			res.render("mountains", {data: mtnDataSorted, allData: mtnData});
			console.log('after start');
			// console.log(result);
		})();
	} catch(err) {
		console.log(err);
	}
});

app.listen(process.env.PORT || 3000, () => {
	console.log('Serving on port ' + (process.env.PORT || 3000));
});
