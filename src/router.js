import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "login",
      component: () => import("./views/Login.vue"),
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("./views/admin/Admin.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/users",
      name: "admin-users",
      component: () => import("./views/admin/UserList.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/database",
      name: "admin-database",
      component: () => import("./views/admin/Database.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/settings",
      name: "admin-settings",
      component: () => import("./views/admin/Settings.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/professor",
      name: "professor",
      component: () => import("./views/professor/Professor.vue"),
      meta: { requiresAuth: true, requiresProfessor: true },
    },
    {
      path: "/professor/polls",
      name: "professor-polls",
      component: () => import("./views/professor/PollList.vue"),
      meta: { requiresAuth: true, requiresProfessor: true },
    },
    {
      path: "/professor/preferences",
      name: "professor-preferences",
      component: () => import("./views/professor/Preferences.vue"),
      meta: { requiresAuth: true, requiresProfessor: true },
    },
    {
      //  ToDo:   Use this as the default landing page for all users?
      //          Or at least student users?
      path: "/polls/history",
      name: "polls-history",
      component: () => import("./views/PollsHistory.vue"),
      //  meta: { requiresAuth: true, },
    },
    {
      path: "/quiz-edit/:id",
      name: "quizEdit",
      component: () => import("./views/professor/QuizEdit.vue"),
    },
    {
      path: "/takeQuiz",
      name: "takeQuiz",
      component: () => import("./views/TakeQuiz.vue"),
    },
    //ToDo:  Remove this POLL reference. This is a test view.
    {
      path: "/poll",
      name: "poll",
      component: () => import("./views/professor/Poll.vue"),
    },
    //  VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
    //  ToDo:  Remove RECIPE references
    {
      path: "/recipes",
      name: "recipes",
      component: () => import("./views/RecipeList.vue"),
    },
    {
      path: "/recipe/:id",
      name: "editRecipe",
      props: true,
      component: () => import("./views/EditRecipe.vue"),
    },
    {
      path: "/ingredients",
      name: "ingredients",
      component: () => import("./views/IngredientList.vue"),
    },
    //  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  ],
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Add "Global Navigation Guard" to check authentication and/or
//  authorization before displaying views.
router.beforeEach((to, from, next) => {
  //  Get any currently logged in user
  const user = JSON.parse(localStorage.getItem("user"));

  //  Check if the route requires admin privileges
  if (to.meta.requiresAdmin) {
    if (user && user.role === "admin") {
      next(); //  User is an admin, allow access
    } else {
      //  Not an admin or not logged in, redirect to a safe page
      next({ name: "recipes" });
    }
  } else if (to.meta.requiresProfessor) {
    if (user && (user.role === "professor" || user.role === "admin")) {
      next(); //  User is a professor or admin -- Allow access
    } else {
      //  Not an admin or not logged in, redirect to a safe page
      next({ name: "recipes" });
    }
  } else if (to.meta.requiresAuth && !user) {
    //  If route requires login and user is not logged in, redirect to login
    next({ name: "login" });
  } else {
    next(); //  Otherwise, allow access
  }
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default router;
