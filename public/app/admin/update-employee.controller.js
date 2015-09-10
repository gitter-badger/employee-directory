(function () {
	'use strict';
	angular.module('app').controller('edUpdateEmployeeCtrl', edUpdateEmployeeCtrl);

	edUpdateEmployeeCtrl.$inject = ['$rootScope', 'edNotifierService', 'edEmployeeService', 'edDeskService'];

	function edUpdateEmployeeCtrl($rootScope, edNotifierService, edEmployeeService, edDeskService) {
		var vm = this;
		vm.updateEmployee = updateEmployee;
		vm.deleteEmployee = deleteEmployee;
		vm.cancelUpdateEmployee = cancelUpdateEmployee;
		vm.desks = edDeskService.getAllDesks();
		vm.selectedEmployee = null;
		vm.genderOptions = [
			{
				value: 'male',
				text: 'Male'
			},
			{
				value: 'female',
				text: 'Female'
			}
		];

		activate();

		function activate() {
			var selectedEmployees = edEmployeeService.setSelectMultipleEmployees(false);
			if (selectedEmployees.length === 1) {
				populateEmployee(selectedEmployees);
			}
		}

		function populateEmployee(selectedEmployees) {
			vm.selectedEmployee = {
				firstName: selectedEmployees[0].firstName,
				lastName: selectedEmployees[0].lastName,
				gender: selectedEmployees[0].gender,
				title: selectedEmployees[0].title,
				department: selectedEmployees[0].department,
				team: selectedEmployees[0].team,
				floor: selectedEmployees[0].floor,
				seat: selectedEmployees[0].seat
			};
		}

		$rootScope.$on('selectedEmployeeChange', function (event, selectedEmployees) {
			if (selectedEmployees.length === 1) {
				populateEmployee(selectedEmployees);
			} else {
				vm.selectedEmployee = null;
			}
		});

		function updateEmployee() {
			// Get the employee data from the form
			var newEmployeeData = {
				firstName: vm.selectedEmployee.firstName,
				lastName: vm.selectedEmployee.lastName,
				gender: vm.selectedEmployee.gender,
				title: vm.selectedEmployee.title,
				department: vm.selectedEmployee.department,
				team: vm.selectedEmployee.team,
				floor: vm.selectedEmployee.floor,
				seat: vm.selectedEmployee.seat
			};

			// Save the image file for uploading
			var imageFile = vm.selectedEmployee.imageFile;

			edEmployeeService.updateEmployee(newEmployeeData).then(function (employee) {
				edNotifierService.notify('Employee information updated!');
				if (imageFile) {
					// upload the file to the file system
					edEmployeeService.uploadEmployeePhoto(imageFile, employee);
					// Now update the employee record in the DB with the correct filename
					edEmployeeService.updateSelectedEmployees(employee);
					newEmployeeData.image = employee._id + '.' + imageFile.name.split('.').pop().toLowerCase();
					edEmployeeService.updateEmployee(newEmployeeData).then(function (employee) {
						//photo upload successful
					}, function () {
						edNotifierService.error('Employee Photo Not Added.');
					});
					imageFile = null;
				}
				vm.selectedEmployee = null;
			}, function (reason) {
				edNotifierService.error(reason);
			});
		}

		/**
		 * Marks employee as deleted
		 */
		function deleteEmployee() {
			var newEmployeeData = {
				deleted: true
			};

			edEmployeeService.updateEmployee(newEmployeeData).then(function (employee) {
				edNotifierService.notify(employee.firstName + ' ' + employee.lastName + ' deleted!');
			}, function (reason) {
				edNotifierService.error(reason);
			});
		}

		function cancelUpdateEmployee() {
			edEmployeeService.removeAllSelectedEmployees();
		}
	}
})();