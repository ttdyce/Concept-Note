import * as nls from "../../../../nls.js";
import { joinPath } from "../../../../base/common/resources.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { IFileDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import {
	MenuId,
	MenuRegistry,
} from "../../../../platform/actions/common/actions.js";
import { ITextFileService } from "../../../services/textfile/common/textfiles.js";
// import { URI } from '../../../../base/common/uri.js';

export const NEW_TODAY_NOTE_COMMAND_ID = "notes.newTodayNote";
export const NEW_TODAY_NOTE_COMMAND_LABEL = nls.localize2(
	"newTodayNote",
	"New Today Note"
);
export const NOTES_CATEGORY = nls.localize2("notesCategory", "Notes");

CommandsRegistry.registerCommand({
	id: NEW_TODAY_NOTE_COMMAND_ID,
	handler: async (
		accessor,
		args?: { languageId?: string; viewType?: string; fileName?: string }
	) => {
		const editorService = accessor.get(IEditorService);
		const dialogService = accessor.get(IFileDialogService);
		const fileService = accessor.get(IFileService);
		const textFileService = accessor.get(ITextFileService);

		const date = new Date();
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
		const day = String(date.getDate()).padStart(2, "0");
		const formattedDate = `${year}-${month}-${day}`;

		const fileName = `${formattedDate}.md`;

		// const createFileLocalized = nls.localize('newFileCommand.saveLabel', "Create File");
		// todo debt 20250115 use the current opened folder properly
		const defaultFileUri = joinPath(
			await dialogService.defaultFilePath(),
			fileName
		);

		const saveUri = defaultFileUri;

		try {
			await fileService.readFile(saveUri);
		} catch {
			// Today Note not found: create one
			try {
				await textFileService.create([{ resource: saveUri }]);
			} catch (error) {
				throw new Error(
					nls.localize(
						"notes.newTodayNote.failed",
						"Unable to create Today Note '{0}' ({1}).",
						fileName,
						error.message
					)
				);
			}
		}

		await editorService.openEditor({
			resource: saveUri,
			options: {
				override: args?.viewType,
				pinned: true,
			},
			languageId: args?.languageId,
		});
	},
});

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
	command: {
		id: NEW_TODAY_NOTE_COMMAND_ID,
		title: NEW_TODAY_NOTE_COMMAND_LABEL,
		category: NOTES_CATEGORY,
	},
});
