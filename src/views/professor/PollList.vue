<script setup>
import { onMounted, ref, computed } from "vue";
import PollCard from "../../components/PollCardComponent.vue";
import PollServices from "../../services/PollServices.js";
import CourseServices from "../../services/CourseServices.js";
import CoursePollServices from "../../services/CoursePollServices.js";
//  import ProfessorServices from "../../services/ProfessorServices.js";
import UserServices from "../../services/UserServices.js";
import { useSnackbar } from "../../composables/useSnackbar.js";
import { useRouter } from 'vue-router';

const router = useRouter();

//  Snackbar composable
const { snackbar, showErrorSnackbar, closeSnackbar } = useSnackbar();

const user = ref(null);     //  Current logged in user
const userRoles = ref([]);  //  List of user user roles
const polls = ref([]);      //  List of polls
const courses = ref([]);
const search = ref("");
const isAdd = ref(false);

const newPoll = ref({
    name: "",
    description: "",
    timePerQuestion: "30",
    isQuiz: false,
    courseId: null,
});

//----------------------------------------------------------------
const pollsByCourse = computed(() => {
    const grouped = {};
    for (const course of courses.value) {
        grouped[course.title] = [];
    }

    //  This displays 3x when the view is loaded.  (?) -> This is because this is called whenever the values update
    console.log("const pollsByCourse = computed(() => {");
    console.log("courses: " + courses);
    console.log("polls: " + polls);

    for (const poll of polls.value) {
        const course = poll.courses?.[0] || null; // assuming one course per poll
        const courseName = course?.title || "Uncategorized";
        if (!grouped[courseName]) grouped[courseName] = [];
        grouped[courseName].push(poll);
    }

    // Apply search filter
    if (search.value.trim() === "") return grouped;

    const filtered = {};
    for (const [courseName, coursePolls] of Object.entries(grouped)) {
        const matching = coursePolls.filter(p =>
            p.name.toLowerCase().includes(search.value.toLowerCase())
        );
        if (matching.length > 0) filtered[courseName] = matching;
    }
    return filtered;
});

//----------------------------------------------------------------
onMounted(async () => {
    user.value = JSON.parse(localStorage.getItem("user"));

    //  Must be authenticated user to get user roles.
    if (user.value !== null) {
        await getUserRoles();
    }

    await getPolls();
});

//----------------------------------------------------------------
function getUserFirstNameLastName() {
    return user.value?.firstName + " " + user.value?.lastName;
}

//----------------------------------------------------------------
//  ToDo:  Put this in a reusable utility service.
//  Get user user roles.
async function getUserRoles() {

    await UserServices.getUserRoles()
        .then((response) => {
            //  ROLES are defined as an array of constants.
            userRoles.value = response.data;
        })
        .catch((error) => {
            console.log(error);
            showErrorSnackbar(error, "Failed to load user roles.");
        });
}

//----------------------------------------------------------------
async function getPolls() {
    user.value = JSON.parse(localStorage.getItem("user"));
    try {
        const response =
            user.value && user.value.id
                ? await PollServices.getPollsByUserId(user.value.id)
                : await PollServices.getPolls();
        polls.value = response.data;
        await getCourses();
    } catch (error) {
        console.log(error);
        showErrorSnackbar(error, "Failed to load polls.");
    }
}

//----------------------------------------------------------------
async function getCourses() {
    try {
        const response = await CourseServices.getCourses();
        courses.value = response.data;
    } catch (error) {
        console.log(error);
        showErrorSnackbar(error, "Failed to load courses.");
    }
}

//----------------------------------------------------------------
async function linkCourseToPoll(pollId, courseId) {
    try {

        await CoursePollServices.createCoursePollLink(pollId, courseId);
        showSnackbar("Course linked successfully!");
    } catch (error) {
        console.log(error);
        showErrorSnackbar(error, "Failed to link course.");
    }
}

//----------------------------------------------------------------
async function unlinkCourseFromPoll(pollId) {
    try {
        await deleteAllLinksForPoll(pollId);
        showSnackbar("Course unlinked successfully!");
    } catch (error) {
        console.log(error);
        showErrorSnackbar(error, "Failed to unlink course.");
    }
}

//----------------------------------------------------------------
async function addPoll() {
    isAdd.value = false;
    newPoll.value.userId = user.value.id;
    let createdPoll = null;
    try {
        const response = await PollServices.addPoll(newPoll.value);
        createdPoll = response.data;
        if (newPoll.value.courseId) {
            await linkCourseToPoll(createdPoll.id, newPoll.value.courseId.id);
        }
        showSnackbar(`${newPoll.value.name} added successfully!`);
    } catch (error) {
        console.log(error);
        showErrorSnackbar(error, "Failed to add poll.");
    }
    navigateToEdit(createdPoll.id);
    await getPolls();
}

//----------------------------------------------------------------
function navigateToEdit(pollId) {
    if (!pollId) return;
    router.push({ name: "quizEdit", params: { id: pollId } });
}

function openAdd() {
    isAdd.value = true;
}

function openUpdate(poll) {
    isAdd.value = true;
    newPoll.value = { ...poll };
}

function closeAdd() {
    isAdd.value = false;
}

//----------------------------------------------------------------
</script>

<template>
    <v-container>
        <div id="body">

            <v-row align="center" class="mb-4">
                <v-col cols="8"><v-card-title class="pl-0 text-h4 font-weight-bold">
                        Polls for Professor {{ getUserFirstNameLastName() }}
                    </v-card-title>
                </v-col>
                <v-col cols="4" class="d-flex justify-end align-center">
                    <v-text-field v-model="search" label="Search quizzes..." prepend-inner-icon="mdi-magnify"
                        hide-details dense clearable class="mr-4"></v-text-field>
                    <v-btn v-if="user !== null" color="accent" @click="openAdd()">Add</v-btn>
                </v-col>
            </v-row>

            <v-expansion-panels multiple>
                <v-expansion-panel v-for="(pollList, courseName) in pollsByCourse" :key="courseName">
                    <v-expansion-panel-title class="text-h6 font-weight-medium">
                        {{ courseName }}
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <PollCard v-for="poll in pollList" :key="poll.id" :poll="poll" @delete="getPolls()" />
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>

            <v-dialog persistent v-model="isAdd" width="800">
                <v-card class="rounded-lg elevation-5">
                    <v-card-title class="headline mb-2">Add Poll</v-card-title>
                    <v-card-text>
                        <v-text-field v-model="newPoll.name" label="Poll Name" required />

                        <v-text-field v-model="newPoll.description" label="Description" />

                        <v-select v-model="newPoll.courseId" :items="[{ id: null, title: 'None' }, ...courses]"
                            item-title="title" item-value="id" label="Select Course" return-object dense />

                        <v-radio-group v-model="newPoll.isQuiz" inline label="Type">
                            <v-radio label="Poll" :value="false" />
                            <v-radio label="Quiz" :value="true" />
                        </v-radio-group>

                        <v-text-field v-model.number="newPoll.secondsPerQuestion" label="Seconds per Question"
                            type="number" step="1" min="1" hide-details />
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer />
                        <v-btn variant="flat" color="secondary" @click="closeAdd()">Close</v-btn>
                        <v-btn variant="flat" color="primary" @click="addPoll()">Add Poll</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <v-snackbar v-model="snackbar.value" rounded="pill">
                {{ snackbar.text }}
                <template v-slot:actions>
                    <v-btn :color="snackbar.color" variant="text" @click="closeSnackBar()">Close</v-btn>
                </template>
            </v-snackbar>
        </div>
    </v-container>
</template>
