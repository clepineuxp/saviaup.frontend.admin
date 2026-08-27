import { TestBed } from '@angular/core/testing';
import { ADMIN_REPOSITORY } from '../../core/data-access/admin.repository';
import { MockAdminRepository } from '../../core/data-access/mock-admin.repository';
import { AdminStore } from '../../core/store/admin.store';
import { PlansComponent } from './plans.component';

describe('PlansComponent', () => {
  let component: PlansComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [AdminStore, { provide: ADMIN_REPOSITORY, useClass: MockAdminRepository }],
    });
    component = TestBed.runInInjectionContext(() => new PlansComponent());
    await component.store.loadPlanPermissionCatalog();
  });

  it('selects every permission in one module and reports the complete state', () => {
    const group = component.permissionGroups()[0];

    component.toggleModulePermissions(group, true);

    expect(component.isModuleSelected(group)).toBe(true);
    expect(component.isModulePartiallySelected(group)).toBe(false);
    expect(component.selectedModulePermissionCount(group)).toBe(group.permissions.length);
    expect(group.permissions.every(({ code }) => component.isPermissionSelected(code))).toBe(true);
  });

  it('preserves other modules when clearing a module and reports partial selection', () => {
    const [firstGroup, secondGroup] = component.permissionGroups();
    const firstPermission = firstGroup.permissions[0];
    const otherModulePermission = secondGroup.permissions[0];
    component.togglePermission(firstPermission.code, true);
    component.togglePermission(otherModulePermission.code, true);

    expect(component.isModulePartiallySelected(firstGroup)).toBe(true);

    component.toggleModulePermissions(firstGroup, false);

    expect(component.selectedModulePermissionCount(firstGroup)).toBe(0);
    expect(component.isPermissionSelected(otherModulePermission.code)).toBe(true);
  });
});
