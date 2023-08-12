import { AxiosResponse } from 'axios';
import * as types from 'src/types/index';

// this file includes functions that handle the serialization of API Endpoints

// /files

// create/file
// METHOD: POST | REQUEST: parent_id, name | RESPONSE: STATUS

// create/folder
// METHOD: POST | REQUEST: parent_id, name | RESPONSE: STATUS

// create/permalink
// METHOD: POST | REQUEST: perm_link_name, perm_link_type, id | RESPONSE: STATUS

// upload/file
// METHOD: POST | REQUEST: parent_id, name, size, file | RESPONSE: STATUS

// update/file
// METHOD: PUT | REQUEST: item_id, ?parent_id, ?name | RESPONSE: STATUS

// update/folder
// METHOD: PUT | REQUEST: item_id, ?parent_id, ?name | RESPONSE: STATUS

// update-sharing/folder
// METHOD: PUT | REQUEST: item_id, shared_recursive, ?shared, ?shared_allow_all_read, ?shared_allow_all_write | RESPONSE: STATUS

// update-sharing/file
// METHOD: PUT | REQUEST: item_id, shared_recursive, ?shared, ?shared_allow_all_read, ?shared_allow_all_write | RESPONSE: STATUS

// folder/<id>
// folder/zip/<id>
// file/<id>
// permalink/<id>
// download/<str:pk>
// file/<id>
// upload-folder

// home
// METHOD: DELETE | REQUEST: - | RESPONSE: STATUS

// list_all_available_folders
// METHOD: DELETE | REQUEST: - | RESPONSE: STATUS

// delete/file/<id>
// METHOD: DELETE | REQUEST: parameter -> id | RESPONSE: STATUS

// delete/folder/<id>
// METHOD: DELETE | REQUEST: parameter -> id | RESPONSE: STATUS
