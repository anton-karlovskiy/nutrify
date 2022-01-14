const classes = {
    0: 'Apple',
    1: 'Artichoke',
    2: 'Avocado',
    3: 'BBQ sauce',
    4: 'Bacon',
    5: 'Bagel',
    6: 'Banana',
    7: 'Beef',
    8: 'Beer',
    9: 'Blueberries',
    10: 'Bread',
    11: 'Broccoli',
    12: 'Butter',
    13: 'Cabbage',
    14: 'Candy',
    15: 'Cantaloupe',
    16: 'Carrot',
    17: 'Cheese',
    18: 'Cherry',
    19: 'Chicken',
    20: 'Chicken wings',
    21: 'Cocktail',
    22: 'Coconut',
    23: 'Coffee',
    24: 'Cookie',
    25: 'Corn chips',
    26: 'Cream',
    27: 'Cucumber',
    28: 'Doughnut',
    29: 'Dumpling',
    30: 'Egg',
    31: 'Egg tart',
    32: 'Eggplant',
    33: 'Fish',
    34: 'French fries',
    35: 'Garlic',
    36: 'Grape',
    37: 'Grapefruit',
    38: 'Green beans',
    39: 'Green onion',
    40: 'Guacamole',
    41: 'Hamburger',
    42: 'Hamimelon',
    43: 'Honey',
    44: 'Ice cream',
    45: 'Kiwi fruit',
    46: 'Lemon',
    47: 'Lettuce',
    48: 'Lime',
    49: 'Lobster',
    50: 'Mango',
    51: 'Meat ball',
    52: 'Milk',
    53: 'Muffin',
    54: 'Mushroom',
    55: 'Noodles',
    56: 'Nuts',
    57: 'Okra',
    58: 'Olive oil',
    59: 'Olives',
    60: 'Onion',
    61: 'Orange',
    62: 'Orange juice',
    63: 'Pancake',
    64: 'Papaya',
    65: 'Pasta',
    66: 'Peach',
    67: 'Pear',
    68: 'Pepper',
    69: 'Pie',
    70: 'Pineapple',
    71: 'Pizza',
    72: 'Plum',
    73: 'Pomegranate',
    74: 'Popcorn',
    75: 'Potato',
    76: 'Prawns',
    77: 'Pretzel',
    78: 'Pumpkin',
    79: 'Radish',
    80: 'Red cabbage',
    81: 'Rice',
    82: 'Salad',
    83: 'Salt',
    84: 'Sandwich',
    85: 'Sausages',
    86: 'Soft drink',
    87: 'Spinach',
    88: 'Spring rolls',
    89: 'Squid',
    90: 'Steak',
    91: 'Strawberries',
    92: 'Sushi',
    93: 'Tea',
    94: 'Tomato',
    95: 'Tomato sauce',
    96: 'Waffle',
    97: 'Watermelon',
    98: 'Wine',
    99: 'Zucchini'
};

// Check to see if TF.js is available
const tfjs_status = document.getElementById("tfjs_status");

if (tfjs_status) {
    tfjs_status.innerText = "Loaded TensorFlow.js - version:" + tf.version.tfjs;
}

let model; // This is in global scope

const loadModel = async () => {
    try {
        const tfliteModel = await tflite.loadTFLiteModel(
            // "models/nutrify_model_78_foods_v0.tflite"
            "models/2022-01-13-nutrify_model_100_foods_v0.tflite"
        );
        model = tfliteModel; // assigning it to the global scope model as tfliteModel can only be used within this scope
        // console.log(tfliteModel);

        //  Check if model loaded
        if (tfliteModel) {
            model_status.innerText = "Model loaded";
        }
    } catch (error) {
        console.log(error);
    }

    // // Prepare input tensors.
    // const img = tf.browser.fromPixels(document.querySelector('img'));
    // const input = tf.sub(tf.div(tf.expandDims(img), 127.5), 1);

    // // Run inference and get output tensors.
    // let outputTensor = tfliteModel.predict(input);
    // console.log(outputTensor.dataSync());
};
loadModel();

// Function to classify image
function classifyImage(model, image) {
    // Preprocess image
    image = tf.image.resizeBilinear(image, [240, 240]); // image size needs to be same as model inputs - EffNetB1 takes 240x240
    image = tf.expandDims(image);
    console.log(image);
    // console.log(model);

    // console.log(tflite.getDTypeFromTFLiteType("uint8")); // Gives int32 as output thus we cast int32 in below line
    // console.log(tflite.getDTypeFromTFLiteType("uint8"));
    console.log("converting image to different datatype...");
    image = tf.cast(image, "int32"); // Model requires uint8
    console.log("model about to predict...");
    const output = model.predict(image);
    const output_values = tf.softmax(output.arraySync()[0]);
    console.log("Arg max:");
    // console.log(output);
    console.log(output_values.arraySync());
    console.log("Output:");
    console.log(output.arraySync());
    console.log(output.arraySync()[0]); // arraySync() Returns an array to use

    // Update HTML
    predicted_class.textContent = classes[output_values.argMax().arraySync()];
    predicted_prob.textContent = output_values.max().arraySync() * 100 + "%";
}

// Image uploading
const fileInput = document.getElementById("file-input");
const image = document.getElementById("image");
const uploadButton = document.getElementById("upload-button");

function getImage() {
    if (!fileInput.files[0]) throw new Error("Image not found");
    const file = fileInput.files[0];

    // Get the data url from the image
    const reader = new FileReader();

    // When reader is ready display image
    reader.onload = function (event) {
        // Get data URL
        const dataUrl = event.target.result;

        // Create image object
        const imageElement = new Image();
        imageElement.src = dataUrl;

        // When image object loaded
        imageElement.onload = function () {
            // Display image
            image.setAttribute("src", this.src);

            // Log image parameters
            const currImage = tf.browser.fromPixels(imageElement);

            // Classify image
            classifyImage(model, currImage);
        };

        document.body.classList.add("image-loaded");
    };

    // Get data url
    reader.readAsDataURL(file);
}

// Add listener to see if someone uploads an image
fileInput.addEventListener("change", getImage);
uploadButton.addEventListener("click", () => fileInput.click());

  // console.log(tf.browser.fromPixels(fileInput.files[0]).print());

  // console.log(tf.browser.fromPixels(document.querySelector("image")));

  // const test_image = new ImageData(1, 1);
  // test_image.data[0] = 100;
  // test_image.data[1] = 150;
  // test_image.data[2] = 200;
  // test_image.data[3] = 255;

  // tf.browser.fromPixels(test_image).print();