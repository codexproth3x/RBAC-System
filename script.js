const STORAGE_KEY = "rbac-data";
const summaryUsers = document.getElementById("summary-users");
const summaryRoles = document.getElementById("summary-roles");
const summaryPermissions = document.getElementById("summary-permissions");
const permissionsList = document.getElementById("permissions-list");
const rolesList = document.getElementById("roles-list");
const usersList = document.getElementById("users-list");
const accessResult = document.getElementById("access-result");

const forms = {
  permission: document.getElementById("permission-form"),
  role: document.getElementById("role-form"),
  rolePermission: document.getElementById("role-permission-form"),
  user: document.getElementById("user-form"),
  userRole: document.getElementById("user-role-form"),
  access: document.getElementById("access-form"),
};

const selects = {
  rolePermissionRole: forms.rolePermission.elements["role"],
  rolePermissionPermission: forms.rolePermission.elements["permission"],
  userRoleUser: forms.userRole.elements["user"],
  userRoleRole: forms.userRole.elements["role"],
  accessUser: forms.access.elements["user"],
  accessPermission: forms.access.elements["permission"],
};

const defaultData = {
  permissions: ["billing.read", "billing.write", "users.manage"],
  roles: [
    { name: "viewer", permissions: ["billing.read"] },
    { name: "admin", permissions: ["billing.read", "billing.write", "users.manage"] },
  ],
  users: [
    { name: "Alice", roles: ["viewer"] },
    { name: "Sam", roles: ["admin"] },
  ],
};

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(defaultData);
  try {
    const parsed = JSON.parse(saved);
    return {
      permissions: parsed.permissions ?? [],
      roles: parsed.roles ?? [],
      users: parsed.users ?? [],
    };
  } catch (err) {
    console.warn("Failed to parse saved data, resetting", err);
    return structuredClone(defaultData);
  }
}

let state = loadData();

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uniqueName(value) {
  return value.trim().toLowerCase();
}

function addPermission(name) {
  const normalized = uniqueName(name);
  if (!normalized) return false;
  if (state.permissions.some((perm) => uniqueName(perm) === normalized)) return false;
  state.permissions.push(name.trim());
  return true;
}

function addRole(name) {
  const normalized = uniqueName(name);
  if (!normalized) return false;
  if (state.roles.some((role) => uniqueName(role.name) === normalized)) return false;
  state.roles.push({ name: name.trim(), permissions: [] });
  return true;
}

function addUser(name) {
  const normalized = uniqueName(name);
  if (!normalized) return false;
  if (state.users.some((user) => uniqueName(user.name) === normalized)) return false;
  state.users.push({ name: name.trim(), roles: [] });
  return true;
}

function connectRolePermission(roleName, permission) {
  const role = state.roles.find((r) => uniqueName(r.name) === uniqueName(roleName));
  if (!role) return false;
  if (!state.permissions.some((perm) => uniqueName(perm) === uniqueName(permission))) return false;
  if (!role.permissions.includes(permission)) {
    role.permissions.push(permission);
  }
  return true;
}

function connectUserRole(userName, roleName) {
  const user = state.users.find((u) => uniqueName(u.name) === uniqueName(userName));
  if (!user) return false;
  if (!state.roles.some((role) => uniqueName(role.name) === uniqueName(roleName))) return false;
  if (!user.roles.includes(roleName)) {
    user.roles.push(roleName);
  }
  return true;
}

function userHasPermission(userName, permission) {
  const user = state.users.find((u) => uniqueName(u.name) === uniqueName(userName));
  if (!user) return false;
  const permissions = new Set();
  user.roles.forEach((roleName) => {
    const role = state.roles.find((r) => uniqueName(r.name) === uniqueName(roleName));
    role?.permissions.forEach((perm) => permissions.add(uniqueName(perm)));
  });
  return permissions.has(uniqueName(permission));
}

function renderSummary() {
  summaryUsers.textContent = state.users.length;
  summaryRoles.textContent = state.roles.length;
  summaryPermissions.textContent = state.permissions.length;
}

function renderPermissions() {
  permissionsList.innerHTML = "";
  if (!state.permissions.length) {
    permissionsList.innerHTML = '<p class="muted">No permissions yet.</p>';
    return;
  }
  state.permissions.forEach((permission) => {
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `<span class="label">${permission}</span>`;
    permissionsList.appendChild(item);
  });
}

function renderRoles() {
  rolesList.innerHTML = "";
  if (!state.roles.length) {
    rolesList.innerHTML = '<p class="muted">No roles yet.</p>';
    return;
  }
  state.roles.forEach((role) => {
    const item = document.createElement("div");
    item.className = "item";
    const permissions = role.permissions.length ? role.permissions.map((perm) => `<span class="label">${perm}</span>`).join(" ") : '<small class="muted">No permissions</small>';
    item.innerHTML = `
      <div>
        <strong>${role.name}</strong>
        <div class="meta">${permissions}</div>
      </div>
      <small>${role.permissions.length} permission${role.permissions.length === 1 ? "" : "s"}</small>
    `;
    rolesList.appendChild(item);
  });
}

function renderUsers() {
  usersList.innerHTML = "";
  if (!state.users.length) {
    usersList.innerHTML = '<p class="muted">No users yet.</p>';
    return;
  }
  state.users.forEach((user) => {
    const item = document.createElement("div");
    item.className = "item";
    const roles = user.roles.length ? user.roles.map((role) => `<span class="label">${role}</span>`).join(" ") : '<small class="muted">No roles</small>';
    item.innerHTML = `
      <div>
        <strong>${user.name}</strong>
        <div class="meta">${roles}</div>
      </div>
      <small>${user.roles.length} role${user.roles.length === 1 ? "" : "s"}</small>
    `;
    usersList.appendChild(item);
  });
}

function renderSelectOptions() {
  const setOptions = (select, values, placeholder) => {
    select.innerHTML = `<option value="" disabled selected hidden>${placeholder}</option>`;
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  };

  setOptions(selects.rolePermissionRole, state.roles.map((r) => r.name), "Choose role");
  setOptions(selects.rolePermissionPermission, state.permissions, "Choose permission");
  setOptions(selects.userRoleUser, state.users.map((u) => u.name), "Choose user");
  setOptions(selects.userRoleRole, state.roles.map((r) => r.name), "Choose role");
  setOptions(selects.accessUser, state.users.map((u) => u.name), "Choose user");
  setOptions(selects.accessPermission, state.permissions, "Choose permission");
}

function resetAccessResult() {
  accessResult.textContent = "";
  accessResult.className = "access-result";
}

function render() {
  renderSummary();
  renderPermissions();
  renderRoles();
  renderUsers();
  renderSelectOptions();
  persist();
}

function showAccessResult(hasAccess, user, permission) {
  accessResult.className = "access-result " + (hasAccess ? "success" : "error");
  accessResult.textContent = hasAccess
    ? `${user} can perform ${permission}`
    : `${user} cannot perform ${permission}`;
}

forms.permission.addEventListener("submit", (event) => {
  event.preventDefault();
  const { permission } = Object.fromEntries(new FormData(forms.permission));
  if (addPermission(permission)) {
    forms.permission.reset();
    render();
  }
});

forms.role.addEventListener("submit", (event) => {
  event.preventDefault();
  const { role } = Object.fromEntries(new FormData(forms.role));
  if (addRole(role)) {
    forms.role.reset();
    render();
  }
});

forms.user.addEventListener("submit", (event) => {
  event.preventDefault();
  const { user } = Object.fromEntries(new FormData(forms.user));
  if (addUser(user)) {
    forms.user.reset();
    render();
  }
});

forms.rolePermission.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(forms.rolePermission));
  if (connectRolePermission(data.role, data.permission)) {
    resetAccessResult();
    render();
  }
});

forms.userRole.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(forms.userRole));
  if (connectUserRole(data.user, data.role)) {
    resetAccessResult();
    render();
  }
});

forms.access.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(forms.access));
  const hasAccess = userHasPermission(data.user, data.permission);
  showAccessResult(hasAccess, data.user, data.permission);
});

document.getElementById("reset-state").addEventListener("click", () => {
  state = structuredClone(defaultData);
  resetAccessResult();
  render();
});

render();
