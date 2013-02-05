/**
* author: topa
* @class CreatorTable usnadňuje práci s vytvořením tabulek.
*/
CreatorTable = JAK.ClassMaker.makeClass({
	NAME: "CreatorTable",
	VERSION: "1.0"
});

/**
 * @param {string} name jmeno tabulky
 * @param {bool} sortable budeme sortovat tabulku podle sloupcu ?
 */
CreatorTable.prototype.$constructor = function(name, options){
	this.table = { name: name, options: {}, columns: [], columnFunctions: [], rows: [] };

	this.table.options = {
		sortable: false,
		className: ""
	}

	for (var p in options) { this.table.options[p] = options[p]; }
}

/**
 * @return {string} name
 */
CreatorTable.prototype.getName = function(){
	return this.table.name;
}

/**
 * @param {string} name
 * @return {bool}
 */
CreatorTable.prototype.existColumn = function(name){
	var columns = this.table.columns;

	for (var key in columns) {
		if(key == name) return true;
	}

	return false;
}

/**
 * @param {object} columns
 */
CreatorTable.prototype.setColumns = function(columns){
	for (var key in columns) this.table.columns[key] = columns[key];
}

/**
 * @param {Array} columns
 */
CreatorTable.prototype.sortColumns = function(columns){
	var sortedColumns = {};

	for (var i = 0; i < columns.length; i++) {
		if(this.existColumn(columns[i])){
			sortedColumns[columns[i]] = this.table.columns[columns[i]];
			delete this.table.columns[columns[i]];
		}
	}

	for (var key in this.table.columns) sortedColumns[key] = this.table.columns[key];

	this.table.columns = sortedColumns;
}

/**
 * @param {Array} columns
 */
CreatorTable.prototype.deleteColumns = function(deleteColumns){
	var columns = this.table.columns;

	for (var i = 0; i < deleteColumns.length; i++) {
		if(columns[deleteColumns[i]] == undefined && deleteColumns[i]== "isDeleted") console.log(123);;
		if(columns[deleteColumns[i]] != undefined) delete columns[deleteColumns[i]];
	}
}

/**
 * Pridava funkce na sloupce.
 * 
 * {columnName: "CTR", funciton: function(){...}}
 *
 * xxx.addColumnFunction("CTR", function(CTR){
 * 	return (parseFloat(CTR) * 100).toString().substring(0, 5) + "%";
 * });
 */
CreatorTable.prototype.addColumnFunction = function(columnName, func){
	this.table.columnFunctions.push({columnName: columnName, f: func});
}

/**
 * @private
 * @param {string} columnName
 * @return {bool}
 */
CreatorTable.prototype._existFunctionForThisColumn = function(columnName){
	for (var i = 0; i < this.table.columnFunctions.length; i++) {
		if(this.table.columnFunctions[i].columnName == columnName) return true;
	}

	return false;
}

/**
 * Spousti funkce navesene na sloupec, funkci lze navesit metodou addColumnFunction(columnName, func)
 *
 * @private
 * @param {string} columnName
 * @param {object} row
 * @return {string}
 */
CreatorTable.prototype._runColumnFunction = function(columnName, row){
	for (var i = 0; i < this.table.columnFunctions.length; i++) {
		if(this.table.columnFunctions[i].columnName == columnName){
			
			try{
				return this.table.columnFunctions[i].f(row);
			}catch(e){
				throw new Error("Nelze spustit funkci: \n " + this.table.columnFunctions[i].f + "\n vstupni parametr: \n " + JSON.stringify(row));
			}
		}
	}
}

/**
 * Na jednotlivých buňkách tabulky spustí přiřazené funkce
 */
CreatorTable.prototype.executeColumnsFunction = function(){
	var functions = this.table.columnFunctions;
	var rows = this.table.rows;

	for (var i = 0; i < rows.length; i++) {
		for (var key in rows[i]) {
			if(this._existFunctionForThisColumn(key)){
				rows[i][key] = this._runColumnFunction(key, rows[i]);	
			} 
		}	
	}
}

/**
 * @param {object} values
 * @param {string} className třída řádku
 */
CreatorTable.prototype.addRow = function(values, className){
	var newRow = {};
	var columns = this.table.columns;

	newRow["_hidden"] = values;

	for (var key in columns) newRow[key] = values[key];

	if (className) newRow._class = className;
	
	this.table.rows.push(newRow);
}

/**
 * vytvoří element tabulky
 * @return {node} vrací element tabulky
 */
CreatorTable.prototype.toHTML = function(){
	var table = JAK.mel("table");
	var rows = this.table.rows;

	if (this.table.options.className) table.className = this.table.options.className;

	var thead = JAK.mel("thead");
	var tbody = JAK.mel("tbody");
	var tr = JAK.mel("tr");

	for (var key in this.table.columns) {
		var th = JAK.mel("th", {innerHTML: this.table.columns[key]});
		th.setAttribute("data-column-name", key);
		tr.appendChild(th);
	}

	thead.appendChild(tr);

	for (var i = 0; i < rows.length; i++) {
		var tr = JAK.mel("tr");

		if ("_class" in rows[i]) tr.className = rows[i]._class;

		for(var key in rows[i]){
			if (key[0] == "_") continue;

			var td = JAK.mel("td");

			if(rows[i][key] instanceof HTMLElement) td.appendChild(rows[i][key]);
			else td.innerHTML = rows[i][key];

			tr.appendChild(td);
		}
		
		tbody.appendChild(tr);
	}

	table.appendChild(thead);
	table.appendChild(tbody);

	return table;
}

