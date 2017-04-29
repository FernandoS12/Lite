$_ready(function(){

	// Listener for the submit button

	function exportNote (content, extension) {
		dialog.showSaveDialog({
			title: "Choose Directory to Export Note",
			buttonLabel: "Export",
			defaultPath: $_("#preview h1").first().text() + '.' + extension
		},
		function(directory){
			if(directory){
				fs.writeFile(directory, content, 'utf8', function (error) {
					if(error){
						dialog.showErrorBox("Error exporting note", "There was an error exporting the note, file was not created.");
						show("preview");
					}else{
						show("preview");
					}
				});
			}
		});
	}

	$_("[data-form='export-note']").submit(function(event){
		event.preventDefault();
	});

	$_("[data-form='export-note'] [data-action='export-skrifa']").click(function(event){

		db.note.where("id").equals(parseInt(id)).first(function(note){
			note.Content = note.Content;
			note.MDate = note.ModificationDate;
			note.CDate = note.CreationDate;
			delete note.Notebook;
			delete note.SyncDate;
			delete note.CreationDate;
			delete note.ModificationDate;
			delete note.id;
			note.Title = $_("#preview h1").first().text().trim() != "" ? $_("#preview h1").first().text() : "Untitled";
			exportNote(JSON.stringify(note), 'skrifa');
		});
	});

	$_("[data-form='export-note'] [data-action='export-md']").click(function(event){

		db.note.where("id").equals(parseInt(id)).first(function(note){
			var und = new upndown();
			und.convert(note.Content, function(error, markdown) {
				if(!error){
					exportNote(markdown, 'md');
				}else{
					dialog.showErrorBox("Error exporting note", "There was an error exporting the note, file was not created.");
					show("preview");
				}
			});
		});
	});

	$_("[data-form='export-note'] [data-action='export-html']").click(function(event){

		fs.readFile(`${app.getAppPath()}/note-template.html`, 'utf8', function (error, data) {
			if(error){
				dialog.showErrorBox("Error Exporting Note", "The note template could not be found, the note was not exported.");
				show("notes");
			}else{
				db.note.where("id").equals(parseInt(id)).first(function(note){
					data = data.replace("{{title}}", $_("#preview h1").first().text().trim() != "" ? $_("#preview h1").first().text() : "Untitled");
					data = data.replace("{{content}}", note.Content);
					exportNote(data, 'html');
				});
			}
		});
	});

	$_("[data-form='export-note'] [data-action='export-pdf']").click(function(event){

		dialog.showSaveDialog({
			title: "Choose Directory to Export Note",
			buttonLabel: "Export",
			defaultPath: $_("#preview h1").first().text() + '.pdf'
		},
		function(directory){
			if(directory){
				htmlBoilerplatePDF({cssPath: `${app.getAppPath()}/style/pdf.css`, paperFormat: 'Letter', paperBorder: '24.892mm'}).from.string($_("#preview").html()).to(directory, function () {
					show("preview");
				});
			}
		});

	});

	// Listener for the cancel button
	$_("[data-view='export-note'] [type='reset']").click(function(){
		show("preview");
	});

});