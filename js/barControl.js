function BarChange(var1, var2) {
	document.getElementById(var1).value = document.getElementById(var2).value;
}

function ControlSite(site) {
	document.getElementById('R' + site).addEventListener('change', function () {
		BarChange('R'+ site + 'Field', 'R' + site);
	}, false);
	document.getElementById('R' + site + 'Field').addEventListener('change', function () {
		BarChange('R' + site, 'R' + site + 'Field');
	}, false);
	document.getElementById('G'+ site +'Field').addEventListener('change', function () {
		BarChange('G'  + site , 'G' + site + 'Field');
	}, false);
	document.getElementById('G' + site).addEventListener('change', function () {
		BarChange('G' + site +'Field', 'G' + site);
	}, false);
	document.getElementById('B'+ site+'Field').addEventListener('change', function () {
		BarChange('B'  + site, 'B' + site+'Field');
	}, false);
	document.getElementById('B'+ site).addEventListener('change', function () {
		BarChange('B' + site+'Field', 'B' + site);
	}, false);
	document.getElementById('volume'+ site+'Field').addEventListener('change', function () {
		BarChange('volume'  + site, 'volume' + site +'Field');
	}, false);
	document.getElementById('volume'+ site).addEventListener('change